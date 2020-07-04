import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  createHashtags,
  getBookmarksWithUsersMapGetGeneric,
} from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import { parseJSON } from 'faunadb/src/_json'
import atob from 'atob'
import btoa from 'btoa'
import { sendCommentNotification } from 'lib/ses'
import absoluteUrl from 'utils/absolute-url'

const serialize = (value) => {
  return btoa(JSON.stringify(value))
}
const parseValue = (value) => {
  return parseJSON(atob(value))
}

const {
  Create,
  HasIdentity,
  Ref,
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
  const { id, hashtag, handle, action, sort } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

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

  if (hashtag) {
    return getBookmarksByHashtag(req, res)
  }

  if (handle) {
    return getBookmarksByUserHandle(req, res)
  }

  if (sort === 'latest') {
    return getLatestBookmarks(req, res)
  }

  if (sort === 'popular') {
    return getPopularBookmarks(req, res)
  }

  if (faunaSecret) {
    return getFollowingBookmarks(req, res)
  }

  return getPopularBookmarks(req, res)
}

async function getPopularBookmarks(req, res) {
  const { first, after: cursor } = req.query
  const size = parseInt(first) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data: any = await client.query(
    getBookmarksWithUsersMapGetGeneric(
      q.Map(
        Paginate(Match(Index('bookmarks_by_ranking')), {
          size,
          after: cursor === 'null' ? undefined : parseValue(cursor),
        }),
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )
  const { before, after, ...edges } = data

  return res.status(200).json({
    edges: flattenDataKeys(edges),
    pageInfo: {
      hasNextPage: Boolean(after),
      endCursor: Boolean(after) ? serialize(after) : null,
    },
  })
}

async function getLatestBookmarks(req, res) {
  const { first, after: cursor } = req.query
  const size = parseInt(first) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data: any = await client.query(
    getBookmarksWithUsersMapGetGeneric(
      q.Map(
        Paginate(Match(Index('all_bookmarks')), {
          size,
          after: cursor === 'null' ? undefined : parseValue(cursor),
        }),
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )
  const { before, after, ...edges } = data

  return res.status(200).json({
    edges: flattenDataKeys(edges),
    pageInfo: {
      hasNextPage: Boolean(after),
      endCursor: Boolean(after) ? serialize(after) : null,
    },
  })
}

async function getFollowingBookmarks(req, res) {
  const { first, after: cursor } = req.query
  const size = parseInt(first) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(401).send('Unauthorized')
  }

  // For logged-in users we show a feed of people they’re following.
  const data: any = await faunaClient(faunaSecret).query(
    getBookmarksWithUsersMapGetGeneric(
      // Since we start of here with follower_stats index (a ref we
      // don't need afterwards, we can use join here!)
      q.Map(
        Paginate(
          // Merge my own bookmarks with those of the people I’m
          // following.
          Union(
            // Fetch the bookmarks of the people I’m following.
            Let(
              {
                userSet: Paginate(
                  Match(
                    Index('follower_stats_by_user_popularity'),
                    Select(['data', 'user'], Get(Identity()))
                  )
                ),
                users: q.Map(
                  Select(['data'], Var('userSet')),
                  Lambda(['score', 'ref'], Var('ref'))
                ),
                peopleBookmarks: q.Map(
                  Var('users'),
                  Lambda('x', Match(Index('bookmarks_by_author'), Var('x')))
                ),
              },
              Union(Var('peopleBookmarks'))
            ),
            // Fetch my own bookmarks.
            Match(
              Index('bookmarks_by_author'),
              Select(['data', 'user'], Get(Identity()))
            )
          ),
          {
            size,
            after: cursor === 'null' ? undefined : parseValue(cursor),
          }
        ),
        // the created time has served its purpose for sorting.
        Lambda(['createdTime', 'ref'], Var('ref'))
      )
    )
  )
  const { before, after, ...edges } = data

  return res.status(200).json({
    edges: flattenDataKeys(edges),
    pageInfo: {
      hasNextPage: Boolean(after),
      endCursor: Boolean(after) ? serialize(after) : null,
    },
  })
}

async function getBookmarksByUserHandle(req, res) {
  const { handle, first, after: cursor = 'null' } = req.query
  const size = parseInt(first) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data: any = await client.query(
    Let(
      {
        setRef: Match(Index('users_by_handle'), handle),
        userRef: Select(0, Paginate(Var('setRef'), { size: 10 })),
        user: Get(Var('userRef')),
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          q.Map(
            Paginate(Match(Index('bookmarks_by_author'), Var('userRef')), {
              size,
              after: cursor === 'null' ? undefined : parseValue(cursor),
            }),
            // The index contains two values so our lambda also takes
            // two values.
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
        followerStatsMatch: If(
          HasIdentity(),
          Match(
            Index('follower_stats_by_author_and_follower'),
            Var('userRef'),
            Select(['data', 'user'], Get(Identity()))
          ),
          false
        ),
        following: If(HasIdentity(), Exists(Var('followerStatsMatch')), false),
      },
      {
        user: Var('user'),
        bookmarks: Var('bookmarks'),
        following: Var('following'),
      }
    )
  )
  const { user, following, bookmarks } = data
  const { before, after, ...edges } = bookmarks

  return res.status(200).json({
    user: flattenDataKeys(user),
    following,
    edges: flattenDataKeys(edges),
    pageInfo: {
      hasNextPage: Boolean(after),
      endCursor: Boolean(after) ? serialize(after) : null,
    },
  })
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
            edges: getBookmarksWithUsersMapGetGeneric([Var('bookmarkRef')]),
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

    const data: any = await faunaClient(faunaSecret).query(
      Let(
        {
          account: Get(Identity()),
          userRef: Select(['data', 'user'], Var('account')),
          userId: Select(['id'], Var('userRef')),
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
              created: Now(),
            },
          }),
          bookmark: Get(Var('bookmarkRef')),
          updateOriginal: Update(Var('bookmarkRef'), {
            data: {
              comments: Add(1, Select(['data', 'comments'], Var('bookmark'))),
            },
          }),
          // We then get the bookmark in the same format as when we
          // normally get them. Since FQL is composable we can easily
          // do this.
          bookmarkWithUserAndAccount: getBookmarksWithUsersMapGetGeneric([
            Var('bookmarkRef'),
          ]),
        },
        {
          comment: Var('comment'),
          userId: Var('userId'),
          bookmarkWithUserAndAccount: Var('bookmarkWithUserAndAccount'),
        }
      )
    )

    const { origin } = absoluteUrl(req)
    const bookmark = data.bookmarkWithUserAndAccount[0]
    const { author, authorEmail } = bookmark

    if (author.ref.id !== data.userId) {
      // Send email notification if the viewer comments on a bookmark
      // that’s not their own.
      sendCommentNotification(authorEmail, `${origin}/b/${bookmarkId}`)
    }

    return res.status(200).json(
      flattenDataKeys({
        comment: data.comment,
      })
    )
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
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
            // Remove all stats related to the bookmark.
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
        edges: Var('bookmarks'),
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

async function getBookmarksByHashtag(req, res) {
  const { hashtag } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data = await client.query(
    Let(
      {
        hashtagRef: Select(
          [0],
          Paginate(Match(Index('hashtags_by_name'), hashtag))
        ),
        bookmarks: getBookmarksWithUsersMapGetGeneric(
          q.Map(
            Paginate(Match(Index('bookmarks_by_hashtag'), Var('hashtagRef'))),
            Lambda(['bookmarkScore', 'bookmarkRef'], Var('bookmarkRef'))
          )
        ),
      },
      {
        edges: Var('bookmarks'),
      }
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}
