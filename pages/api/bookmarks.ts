import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
} from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

const {
  Create,
  HasIdentity,
  Ref,
  Join,
  Count,
  Update,
  Add,
  Not,
  Do,
  Subtract,
  Collection,
  Select,
  Get,
  Identity,
  Contains,
  Now,
  Union,
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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, handle, action } = req.query

  if (action === 'create') {
    return createBookmark(req, res)
  }

  if (action === 'delete') {
    return deleteBookmark(req, res)
  }

  if (action === 'comment') {
    return createComment(req, res)
  }

  if (action === 'delete-comment') {
    return deleteComment(req, res)
  }

  if (action === 'like') {
    return likeBookmark(req, res)
  }

  if (id) {
    return getBookmarksByReference(req, res)
  }

  if (handle) {
    return getBookmarksByUserHandle(req, res)
  }

  return getBookmarks(req, res)
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

  const data = await faunaClient(faunaSecret).query(
    Let(
      {
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          // Since we start of here with follower_stats index (a ref we
          // don't need afterwards, we can use join here!)
          q.Map(
            Paginate(
              // Merge my own bookmarks with those of the people I’m
              // following.
              Union(
                // Fetch the bookmarks of the people I’m following.
                Join(
                  // the index takes one term, the user that is browsing
                  // our app
                  Match(
                    Index('follower_stats_by_user_popularity'),
                    Select(['data', 'user'], Get(Identity()))
                  ),
                  // Join can also take a lambda, and we have to use a
                  // lambda since our index returns more than one
                  // variable. Our index again contains two values (the
                  // score and the author ref), so takes an array of two
                  // values We only care about the author ref which we
                  // will feed into the bookmarks_by_author index, to get
                  // bookmark references. Added advantage, because we use a
                  // join here we can let the index sort as well ;).
                  Lambda(
                    ['bookmarkScore', 'authorRef'],
                    Match(Index('bookmarks_by_author'), Var('authorRef'))
                  )
                ),
                // Fetch my own bookmarks.
                Match(
                  Index('bookmarks_by_author'),
                  Select(['data', 'user'], Get(Identity()))
                )
              )
            ),
            // the created time has served its purpose for sorting.
            Lambda(['createdTime', 'ref'], Var('ref'))
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
            // The index contains two values so our lambda also takes
            // two values.
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
        followerStatsMatch: If(
          HasIdentity(),
          Match(
            Index('follower_stats_by_author_and_follower'),
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

async function likeBookmark(req, res) {
  const { bookmarkId } = await req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!bookmarkId) {
      throw new Error('Bookmark ID must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          account: Get(Identity()),
          userRef: Select(['data', 'user'], Var('account')),
          bookmarkRef: Ref(Collection('Bookmarks'), bookmarkId),
          bookmarkStatsRef: Match(
            Index('bookmark_stats_by_user_and_bookmark'),
            Var('userRef'),
            Var('bookmarkRef')
          ),
          bookmark: Get(Var('bookmarkRef')),
          authorRef: Select(['data', 'author'], Var('bookmark')),
          followerStatsRef: Match(
            Index('follower_stats_by_author_and_follower'),
            Var('authorRef'),
            Var('userRef')
          ),
          newLikeStatus: If(
            Exists(Var('bookmarkStatsRef')),
            Not(Select(['data', 'like'], Get(Var('bookmarkStatsRef')))),
            true
          ),
          popularityGain: If(Var('newLikeStatus'), 1, -1),
        },
        Do(
          // Update the bookmark so we have an idea of the total likes
          If(
            Var('newLikeStatus'),
            Update(Var('bookmarkRef'), {
              data: {
                likes: Add(Select(['data', 'likes'], Var('bookmark')), 1),
              },
            }),
            Update(Var('bookmarkRef'), {
              data: {
                likes: Subtract(Select(['data', 'likes'], Var('bookmark')), 1),
              },
            })
          ),
          // Update bookmark stats so we know who liked what
          If(
            Exists(Var('bookmarkStatsRef')),
            // Getting the same element twice has no impact on reads,
            // the query will only get it once.
            Update(Select(['ref'], Get(Var('bookmarkStatsRef'))), {
              data: {
                like: Var('newLikeStatus'),
              },
            }),
            Create(Collection('BookmarkStats'), {
              data: {
                user: Var('userRef'),
                bookmark: Var('bookmarkRef'),
                like: Var('newLikeStatus'),
                repost: false,
                comment: false,
              },
            })
          ),
          // Update the follower stats so we can raise his popularity,
          // this has an impact on the feed that the user will see,
          // every post he likes or retweets from an author he follows
          // will raise the popularity of the author for this
          // particular user (this is kept in the followerstats
          // collection) return the new bookmark with its stats.
          If(
            Exists(Var('followerStatsRef')),
            Update(Select(['ref'], Get(Var('followerStatsRef'))), {
              data: {
                postLikes: Add(
                  Select(['data', 'postLikes'], Get(Var('followerStatsRef'))),
                  Var('popularityGain')
                ),
              },
            }),
            // We don't keep stats for people we don't follow (we
            // could but opted not to).
            true
          ),
          {
            bookmarks: getBookmarksWithUsersMapGetGeneric([Var('bookmarkRef')]),
          }
        )
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
}

async function deleteComment(req, res) {
  const { commentId } = await req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  const data = await faunaClient(faunaSecret).query(
    Let(
      {
        account: Get(Identity()),
        userRef: Select(['data', 'user'], Var('account')),
        commentRef: Ref(Collection('Comments'), commentId),
        comment: Get(Var('commentRef')),
        bookmarkRef: Select(['data', 'bookmark'], Var('comment')),
        bookmarkStatsRef: Match(
          Index('bookmark_stats_by_user_and_bookmark'),
          Var('userRef'),
          Var('bookmarkRef')
        ),
        // Check if bookmark has only this one comment of mine or if there
        // are others.
        commentCount: Count(
          Match(
            Index('comments_by_bookmark_and_author_ordered'),
            Var('bookmarkRef'),
            Var('userRef')
          )
        ),
        bookmarkStats: If(
          Equals(Var('commentCount'), 1),
          // If only this one comment, update bookmarkStats to `{ comment: false }`.
          Update(Select(['ref'], Get(Var('bookmarkStatsRef'))), {
            data: {
              comment: false,
            },
          }),
          // If there are more comments leave bookmarkStats untouched.
          true
        ),
        bookmark: Get(Var('bookmarkRef')),
        // Subtract 1 from comment-count on bookmark.
        updateOriginal: Update(Var('bookmarkRef'), {
          data: {
            comments: Subtract(
              Select(['data', 'comments'], Var('bookmark')),
              1
            ),
          },
        }),
        // Remove comment itself.
        delete: Delete(Var('commentRef')),
        // We then get the bookmark in the same format as when we normally get them.
        // Since FQL is composable we can easily do this.
        bookmarkWithUserAndAccount: getBookmarksWithUsersMapGetGeneric([
          Var('bookmarkRef'),
        ]),
      },
      {
        comment: Var('comment'),
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
      Let(
        {
          account: Get(Identity()),
          userRef: Select(['data', 'user'], Var('account')),
          bookmarkRef: Ref(Collection('Bookmarks'), bookmarkId),
          bookmarkStatsRef: Match(
            Index('bookmark_stats_by_user_and_bookmark'),
            Var('userRef'),
            Var('bookmarkRef')
          ),
          bookmarkStats: If(
            Exists(Var('bookmarkStatsRef')),
            Update(Select(['ref'], Get(Var('bookmarkStatsRef'))), {
              data: {
                comment: true,
              },
            }),
            Create(Collection('BookmarkStats'), {
              data: {
                user: Var('userRef'),
                bookmark: Var('bookmarkRef'),
                like: false,
                repost: false,
                comment: true,
              },
            })
          ),
          comment: Create(Collection('Comments'), {
            data: {
              text: text,
              author: Select(['data', 'user'], Get(Identity())),
              bookmark: Var('bookmarkRef'),
            },
          }),
          bookmark: Get(Var('bookmarkRef')),
          updateOriginal: Update(Var('bookmarkRef'), {
            data: {
              comments: Add(1, Select(['data', 'comments'], Var('bookmark'))),
            },
          }),
          // We then get the bookmark in the same format as when we normally get them.
          // Since FQL is composable we can easily do this.
          bookmarkWithUserAndAccount: getBookmarksWithUsersMapGetGeneric([
            Var('bookmarkRef'),
          ]),
        },
        {
          comment: Var('comment'),
        }
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
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
          // Check if user is allowed to delete this bookmark.
          Equals(Var('viewer'), Var('author')),
          q.Do(
            // Remove all the comments on the bookmark.
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
              Lambda(['ts', 'commentRef'], Delete(Var('commentRef')))
            ),
            // Remove all stats related to the bookmar.
            q.Map(
              Paginate(
                Match(Index('bookmark_stats_by_bookmark'), Var('bookmarkRef')),
                {
                  size: 100000,
                }
              ),
              Lambda(['bookmarkStatsRef'], Delete(Var('bookmarkStatsRef')))
            ),
            // Remove bookmark itself.
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
  const { text, details, category, hashtags } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!text) {
      throw new Error('A text must be provided.')
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
            text,
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

export const bookmarkApi = async (bookmarkId: string, faunaSecret?: string) => {
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient
  const data = await client.query(
    Let(
      {
        bookmarkRef: Ref(Collection('Bookmarks'), bookmarkId),
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

  // Bit awkward to first stringify the data and then parse it again
  // as JSON, but it could still contain FQL and this is the only way
  // I found to get rid of it.
  const json = JSON.stringify(flattenDataKeys(data))
  return JSON.parse(json)
}

async function getBookmarksByReference(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  return res.status(200).send(await bookmarkApi(id, faunaSecret))
}

async function getAllBookmarks(req, res) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const { data } = await client.query(
    getBookmarksWithUsersMapGetGeneric(
      q.Map(
        Paginate(Match(Index('all_bookmarks'))),
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )

  return res.status(200).json({
    bookmarks: data.map(flattenDataKeys),
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
          // Get the original bookmark
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
          // Get the category the bookmark belongs to.
          category: Get(Select(['data', 'category'], Var('bookmark'))),
          // Get the user that wrote the bookmark.
          user: Get(Select(['data', 'author'], Var('bookmark'))),
          // Get the account via identity.
          account: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('account')),
            false
          ),
          // Get the statistics for the bookmark
          bookmarkStatsMatch: Match(
            Index('bookmark_stats_by_user_and_bookmark'),
            Var('currentUserRef'),
            Select(['ref'], Var('bookmark'))
          ),
          followerStatsMatch: Match(
            Index('follower_stats_by_author_and_follower'),
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
          category: Var('category'),
          original: Var('original'),
          bookmark: Var('bookmark'),
          bookmarkStats: Var('bookmarkStats'),
          comments: Var('comments'),
        }
      )
    )
  )
}
