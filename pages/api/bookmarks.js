import { query as q } from 'faunadb'
import { faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import cookie from 'cookie'

const {
  Create,
  Ref,
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
  const { id, username, action } = args[0].query

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

  if (username) {
    return getBookmarksByUsername(...args)
  }

  return getAllBookmarks(...args)
}

async function getBookmarksByUsername(req, res) {
  const { username } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  const data = await faunaClient(faunaSecret).query(
    Let(
      {
        setRef: Match(Index('users_by_name'), username.toLowerCase()),
        authorRef: Select(0, Paginate(Var('setRef'), { size: 10 })),
        author: Get(Var('authorRef')),
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          q.Map(
            Paginate(Match(Index('bookmarks_by_author'), Var('authorRef'))),
            // The index contains two values so our lambda also takes two values.
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
      },
      {
        author: Var('author'),
        bookmarks: Var('bookmarks'),
      }
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

function getBookmarksWithUsersMapGetGeneric(BookmarksSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    // For all bookmarks this is just
    // Paginate(Documents(Collection('Bookmarks'))), else it's a match
    // on an index.
    BookmarksSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          bookmark: Get(Var('ref')),
          original: If(
            Contains(['data', 'original'], Var('bookmark')),
            // Repost bookmark, get original bookmark's data. We want to
            // get the original as well in the same structure, let's
            // just use recursion to construct that query, we could
            // get the whole rebookmark chain like this, it looks a
            // bit like traversing a graph. We are only interested in
            // the first rebookmark so we pas depth 1 as default,
            // depth is meant to make sure sure we don't loop
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
            // normal bookmark, there is no original
            false
          ),
          // Get the user that wrote the bookmark.
          user: Get(Select(['data', 'author'], Var('bookmark'))),
          // Get the account via identity
          account: Get(Identity()),
          // Get the user that is currently logged in.
          currentUserRef: Select(['data', 'user'], Var('account')),
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

async function createComment(req, res) {
  const { text, entity } = await req.body
  const collection = entity.type === 'COLLECTION' ? 'Collections' : 'Bookmarks'
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
          entity: Ref(Collection(collection), entity.id),
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

async function createHashtags(tags) {
  // tags is an array that looks like:
  // [{ name: 'hash' }, { name: 'tag' }]
  return q.Map(
    tags,
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
  const { title, description, details, category, tags } = req.body
  console.log(tags)
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
          hashtagRefs: await createHashtags(tags),
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

  const data = await faunaClient(faunaSecret).query(
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

  const response = await faunaClient(faunaSecret).query(
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
