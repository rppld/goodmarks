import { query as q } from 'faunadb'
import { serverClient, faunaClient, FAUNA_SECRET_COOKIE } from 'lib/fauna'
import { flattenDataKeys } from 'lib/fauna/utils'
import cookie from 'cookie'

const {
  Create,
  HasIdentity,
  Ref,
  Join,
  Collection,
  Select,
  Get,
  Identity,
  Contains,
  Now,
  Paginate,
  Let,
  Lambda,
  Var,
  Exists,
  Match,
  Index,
  If,
  Delete,
  Equals,
  Abort,
} = q

export default async (...args) => {
  const req = args[0]
  const { id, handle, action } = req.query

  if (action === 'create') {
    return createBookmark(...args)
  }

  if (action === 'delete') {
    return deleteBookmark(...args)
  }

  if (action === 'comment') {
    return createComment(...args)
  }

  if (id) {
    return getBookmarksByReference(...args)
  }

  if (handle) {
    return getBookmarksByUserHandle(...args)
  }

  return getBookmarks(...args)
}

async function getBookmarks(req, res) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    // TODO: This is only temporary to have content on the homepage.
    // Should eventually be removed because we won’t need to render
    // all bookmarks anywhere.
    return getAllBookmarks(req, res)
  }

  const response = await faunaClient(faunaSecret).query(
    getBookmarksWithUsersMapGetGeneric(
      // Since we start of here with followerstats index (a ref we don't need afterwards, we can use join here!)
      q.Map(
        Paginate(
          Join(
            // the index takes one term, the user that is browsing our app
            Match(
              Index('followerstats_by_user_popularity'),
              Select(['data', 'user'], Get(Identity()))
            ),
            // Join can also take a lambda, and we have to use a
            // lambda since our index returns more than one variable.
            // Our index again contains two values (the score and the
            // author ref), so takes an array of two values We only
            // care about the author ref which we will feed into the
            // fweets_by_author index, to get fweet references. Added
            // advantage, because we use a join here we can let the
            // index sort as well ;).
            Lambda(
              ['bookmarkScore', 'authorRef'],
              Match(Index('bookmarks_by_author'), Var('authorRef'))
            )
          )
        ),
        // the created time has served its purpose for sorting.
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )

  return res.status(200).json({
    bookmarks: response.data.map(flattenDataKeys),
  })
}

async function getBookmarksByUserHandle(req, res) {
  const { handle } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data = await client.query(
    Let(
      {
        setRef: Match(Index('users_by_handle'), handle.toLowerCase()),
        authorRef: Select(0, Paginate(Var('setRef'), { size: 10 })),
        author: Get(Var('authorRef')),
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          q.Map(
            Paginate(Match(Index('bookmarks_by_author'), Var('authorRef'))),
            // The index contains two values so our lambda also takes two values.
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
        followerStatsMatch: If(
          HasIdentity(),
          Match(
            Index('followerstats_by_author_and_follower'),
            Var('authorRef'),
            Select(['data', 'user'], Get(Identity()))
          ),
          false
        ),
        following: If(HasIdentity(), Exists(Var('followerStatsMatch')), false),
      },
      {
        author: Var('author'),
        bookmarks: Var('bookmarks'),
        following: Var('following'),
      }
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

async function createComment(req, res) {
  const { text, bookmarkId } = await req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!text) {
      throw new Error('Text must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Comments'), {
        data: {
          text,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
          bookmark: Ref(Collection('Bookmarks'), bookmarkId),
        },
      })
    )

    res.status(200).json({
      ...data.data,
      id: data.ref.id,
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function createHashtags(items) {
  // items is an array that looks like:
  // [{ name: 'hash' }, { name: 'tag' }]
  return q.Map(
    items,
    Lambda(
      ['hashtag'],
      Let(
        {
          match: Match(Index('hashtags_by_name'), Var('hashtag')),
        },
        If(
          Exists(Var('match')),
          // Paginate returns a { data: [ <references> ]} object. We
          // validated that there is one element with exists already.
          // We can fetch it with Select(['data', 0], ...)
          Select(['data', 0], Paginate(Var('match'))),
          // If it doesn't exist we create it and return the reference.
          Select(
            ['ref'],
            Create(Collection('Hashtags'), {
              data: { name: Var('hashtag') },
            })
          )
        )
      )
    )
  )
}

async function deleteBookmark(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!id) {
      throw new Error('Bookmark ID must be provided.')
    }

    await faunaClient(faunaSecret).query(
      Let(
        {
          viewer: Select(['data', 'user'], Get(Identity())),
          bookmarkRef: Ref(Collection('Bookmarks'), id),
          bookmark: Get(Var('bookmarkRef')),
          author: Select(['data', 'author'], Var('bookmark')),
        },
        q.If(
          // 1. Check if user is allowed to delete this bookmark.
          Equals(Var('viewer'), Var('author')),
          q.Do(
            // 2. Remove all the comments on the bookmark.
            q.Map(
              Paginate(
                Match(
                  Index('comments_by_bookmark_ordered'),
                  Var('bookmarkRef')
                ),
                {
                  size: 100000,
                }
              ),
              Lambda('x', Delete(Var('x')))
            ),
            // 3. Remove bookmark itself.
            Delete(Var('bookmarkRef'))
          ),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).send('Comments and bookmark successfully deleted.')
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function createBookmark(req, res) {
  const { title, description, details, category, hashtags } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const {
    Create,
    Select,
    Paginate,
    Identity,
    Now,
    Get,
    Collection,
    Match,
    Index,
    Let,
    Var,
  } = q

  try {
    if (!title) {
      throw new Error('Title and link must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          hashtagRefs: await createHashtags(hashtags),
          category: Select(
            0,
            Paginate(Match(Index('categories_by_slug'), category))
          ),
          author: Select(['data', 'user'], Get(Identity())),
        },
        Create(Collection('Bookmarks'), {
          data: {
            title,
            description,
            likes: 0,
            comments: 0,
            reposts: 0,
            hashtags: Var('hashtagRefs'),
            category: Var('category'),
            details,
            author: Var('author'),
            created: Now(),
          },
        })
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function getBookmarksByReference(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data = await client.query(
    Let(
      {
        bookmarkRef: Ref(Collection('Bookmarks'), id),
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          q.Map(
            Paginate(
              Match(Index('bookmarks_by_reference'), Var('bookmarkRef'))
            ),
            Lambda(['nextRef', 'title', 'author'], Var('nextRef'))
          )
        ),
      },
      {
        bookmarks: Var('bookmarks'),
      }
    )
  )
  return res.status(200).json(flattenDataKeys(data))
}

async function getAllBookmarks(req, res) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const response = await client.query(
    getBookmarksWithUsersMapGetGeneric(
      q.Map(
        Paginate(Match(Index('all_bookmarks'))),
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )

  return res.status(200).json({
    bookmarks: response.data.map(flattenDataKeys),
  })
}

function getBookmarksWithUsersMapGetGeneric(bookmarksSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    // For all bookmarks this is just
    // Paginate(Documents(Collection('Bookmarks'))), else it's a match
    // on an index.
    bookmarksSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          bookmark: Get(Var('ref')),
          original: If(
            Contains(['data', 'original'], Var('bookmark')),
            // Reposted bookmark. Get original bookmark's data. We
            // want to get the original as well in the same structure,
            // let's just use recursion to construct that query, we
            // could get the whole repost chain like this, it looks a
            // bit like traversing a graph. We are only interested in
            // the first reposted bookmark so we pas depth 1 as
            // default, depth is meant to make sure sure we don't loop
            // endelessly in javascript.
            depth > 0
              ? Select(
                  [0],
                  getBookmarksWithUsersMapGetGeneric(
                    [Select(['data', 'original'], Var('bookmark'))],
                    depth - 1
                  )
                )
              : false,
            // Normal bookmark, there is no original.
            false
          ),
          // Get the user that wrote the bookmark.
          user: Get(Select(['data', 'author'], Var('bookmark'))),
          // Get the account via identity
          account: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('account')),
            false
          ),
          // Get the original bookmark
          // Get the statistics for the bookmark
          bookmarkStatsMatch: Match(
            Index('bookmarkstats_by_user_and_bookmark'),
            Var('currentUserRef'),
            Select(['ref'], Var('bookmark'))
          ),
          followerStatsMatch: Match(
            Index('followerstats_by_author_and_follower'),
            Var('currentUserRef'),
            Select(['ref'], Var('bookmark'))
          ),
          bookmarkStats: If(
            Exists(Var('bookmarkStatsMatch')),
            Get(Var('bookmarkStatsMatch')),
            {}
          ),
          // Get comments, index has two values so lambda has two values
          comments: q.Map(
            Paginate(Match(Index('comments_by_bookmark_ordered'), Var('ref'))),
            Lambda(
              ['ts', 'commentRef'],
              Let(
                {
                  comment: Get(Var('commentRef')),
                  author: Get(Select(['data', 'author'], Var('comment'))),
                },
                {
                  comment: Var('comment'),
                  author: Var('author'),
                }
              )
            )
          ),
        },
        // Return our elements
        {
          user: Var('user'),
          original: Var('original'),
          bookmark: Var('bookmark'),
          bookmarkStats: Var('bookmarkStats'),
          comments: Var('comments'),
        }
      )
    )
  )
}
