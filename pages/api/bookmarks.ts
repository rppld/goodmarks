import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  CreateHashtags,
  TransformBookmarksData,
  CreateNotification,
  serialize,
  parseValue,
} from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

const {
  If,
  Foreach,
  Map,
  Create,
  IsNonEmpty,
  HasCurrentIdentity,
  Ref,
  Count,
  Reverse,
  Update,
  Add,
  Not,
  Do,
  Subtract,
  Collection,
  Select,
  Get,
  CurrentIdentity,
  Now,
  Union,
  Paginate,
  Let,
  Lambda,
  Var,
  Exists,
  Match,
  Index,
  Delete,
  Equals,
  Abort,
} = q

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, hashtag, list, handle, action, sort } = req.query
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

  if (list) {
    return getBookmarksByList(req, res)
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
    TransformBookmarksData(
      Map(
        Paginate(Match(Index('bookmarks_by_ranking')), {
          size,
          after: cursor === 'null' ? undefined : parseValue(cursor),
        }),
        Lambda(['bookmarkRanking', 'ref'], Var('ref'))
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
    TransformBookmarksData(
      Map(
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
    TransformBookmarksData(
      // Since we start of here with follower_stats index (a ref we
      // don't need afterwards, we can use join here!)
      Map(
        Paginate(
          Let(
            {
              userSet: Paginate(
                Match(
                  Index('follower_stats_by_user_popularity'),
                  Select(['data', 'user'], Get(CurrentIdentity()))
                )
              ),
              users: Map(
                Select(['data'], Var('userSet')),
                Lambda(['score', 'ref'], Var('ref'))
              ),
              // Fetch the bookmarks of the people I’m following.
              peopleBookmarks: Map(
                Var('users'),
                Lambda('x', Match(Index('bookmarks_by_author'), Var('x')))
              ),
              // Union can’t handle empty arrays, so gotta check for that.
              flattenedPeopleBookmarks: If(
                IsNonEmpty(Var('peopleBookmarks')),
                Union(Var('peopleBookmarks')),
                false
              ),
              // Fetch my own bookmarks.
              myOwnBookmarks: Match(
                Index('bookmarks_by_author'),
                Select(['data', 'user'], Get(CurrentIdentity()))
              ),
              // Merge my own bookmarks with those of the people I’m
              // following. Check if it’s empty first, as Union can’t
              // handle empty arrays. Would throw an error for example
              // if you’re not following anyone yet because
              // `peopleBookmarks` would be empty then.
              mergedBookmarks: If(
                IsNonEmpty(Var('peopleBookmarks')),
                Union(Var('flattenedPeopleBookmarks'), Var('myOwnBookmarks')),
                Var('myOwnBookmarks')
              ),
            },
            Var('mergedBookmarks')
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

async function getBookmarksByList(req, res) {
  const { list, first, after: cursor = 'null' } = req.query
  const size = parseInt(first) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data: any = await client.query(
    Let(
      {
        listRef: Ref(Collection('lists'), list),
        bookmarks: TransformBookmarksData(
          Reverse(
            Map(
              Paginate(Match(Index('list_items_by_list'), Var('listRef')), {
                size,
                after: cursor === 'null' ? undefined : parseValue(cursor),
              }),
              Lambda(['createdAt', 'object', 'itemRef'], Var('object'))
            )
          )
        ),
      },
      {
        bookmarks: Var('bookmarks'),
      }
    )
  )
  const { bookmarks } = data
  const { before, after, ...edges } = bookmarks

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
        bookmarks: TransformBookmarksData(
          Map(
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
          HasCurrentIdentity(),
          Match(
            Index('follower_stats_by_author_and_follower'),
            Var('userRef'),
            Select(['data', 'user'], Get(CurrentIdentity()))
          ),
          false
        ),
        following: If(
          HasCurrentIdentity(),
          Exists(Var('followerStatsMatch')),
          false
        ),
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

    await faunaClient(faunaSecret).query(
      Let(
        {
          account: Get(CurrentIdentity()),
          currentUserRef: Select(['data', 'user'], Var('account')),
          currentUserId: Select(['id'], Var('currentUserRef')),
          bookmarkRef: Ref(Collection('bookmarks'), bookmarkId),
          bookmarkStatsRef: Match(
            Index('bookmark_stats_by_user_and_bookmark'),
            Var('currentUserRef'),
            Var('bookmarkRef')
          ),
          bookmark: Get(Var('bookmarkRef')),
          authorRef: Select(['data', 'author'], Var('bookmark')),
          authorId: Select(['id'], Var('authorRef')),
          followerStatsRef: Match(
            Index('follower_stats_by_author_and_follower'),
            Var('authorRef'),
            Var('currentUserRef')
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

            Create(Collection('bookmark_stats'), {
              data: {
                user: Var('currentUserRef'),
                bookmark: Var('bookmarkRef'),
                like: Var('newLikeStatus'),
                repost: false,
                comment: false,
              },
            })
          ),
          If(
            Var('newLikeStatus'),
            If(
              // Create notification if author ID doesn’t equal current user ID.
              Equals(Var('authorId'), Var('currentUserId')),
              false,
              CreateNotification({
                type: 'NEW_LIKE',
                sender: Var('currentUserRef'),
                recipient: Var('authorRef'),
                object: Var('bookmarkRef'),
                objectType: 'BOOKMARK',
              })
            ),
            false
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
          )
        )
      )
    )

    return res.status(200).end('Bookmark liked')
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
        account: Get(CurrentIdentity()),
        userRef: Select(['data', 'user'], Var('account')),
        commentRef: Ref(Collection('comments'), commentId),
        comment: Get(Var('commentRef')),
        bookmarkRef: Select(['data', 'object'], Var('comment')),
        bookmarkStatsRef: Match(
          Index('bookmark_stats_by_user_and_bookmark'),
          Var('userRef'),
          Var('bookmarkRef')
        ),
        // Check if bookmark has only this one comment of mine or if there
        // are others.
        commentCount: Count(
          Match(
            Index('comments_by_object_and_author_ordered'),
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
          account: Get(CurrentIdentity()),
          currentUserRef: Select(['data', 'user'], Var('account')),
          currentUserId: Select(['id'], Var('currentUserRef')),
          bookmarkRef: Ref(Collection('bookmarks'), bookmarkId),
          bookmarkStatsRef: Match(
            Index('bookmark_stats_by_user_and_bookmark'),
            Var('currentUserRef'),
            Var('bookmarkRef')
          ),
          bookmarkStats: If(
            Exists(Var('bookmarkStatsRef')),
            Update(Select(['ref'], Get(Var('bookmarkStatsRef'))), {
              data: {
                comment: true,
              },
            }),
            Create(Collection('bookmark_stats'), {
              data: {
                user: Var('currentUserRef'),
                bookmark: Var('bookmarkRef'),
                like: false,
                repost: false,
                comment: true,
              },
            })
          ),
          comment: Create(Collection('comments'), {
            data: {
              text: text,
              author: Select(['data', 'user'], Get(CurrentIdentity())),
              object: Var('bookmarkRef'),
              created: Now(),
            },
          }),
          bookmark: Get(Var('bookmarkRef')),
          bookmarkAuthorRef: Select(['data', 'author'], Var('bookmark')),
          bookmarkAuthorId: Select('id', Var('bookmarkAuthorRef')),
          updateOriginal: Update(Var('bookmarkRef'), {
            data: {
              comments: Add(1, Select(['data', 'comments'], Var('bookmark'))),
            },
          }),
        },
        Do(
          If(
            Equals(Var('bookmarkAuthorId'), Var('currentUserId')),
            false,
            CreateNotification({
              type: 'NEW_COMMENT',
              sender: Var('currentUserRef'),
              recipient: Var('bookmarkAuthorRef'),
              object: Var('bookmarkRef'),
              objectType: 'BOOKMARK',
            })
          ),
          {
            comment: Var('comment'),
            currentUserId: Var('currentUserId'),
            currentUserRef: Var('currentUserRef'),
            bookmarkRef: Var('bookmarkRef'),
            bookmarkAuthorRef: Var('bookmarkAuthorRef'),
            bookmark: Var('bookmark'),
          }
        )
      )
    )

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
          viewer: Select(['data', 'user'], Get(CurrentIdentity())),
          bookmarkRef: Ref(Collection('bookmarks'), id),
          bookmark: Get(Var('bookmarkRef')),
          author: Select(['data', 'author'], Var('bookmark')),
        },
        If(
          // Check if user is allowed to delete this bookmark.
          Equals(Var('viewer'), Var('author')),
          Do(
            // Remove all the comments on the bookmark.
            Foreach(
              Paginate(
                Match(Index('comments_by_object_ordered'), Var('bookmarkRef')),
                {
                  size: 100000,
                }
              ),
              Lambda(['createdTime', 'commentRef'], Delete(Var('commentRef')))
            ),
            // Remove all stats related to the bookmark.
            Foreach(
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
          hashtagRefs: await CreateHashtags(hashtags),
          category: Select(
            0,
            Paginate(Match(Index('categories_by_slug'), category))
          ),
          author: Select(['data', 'user'], Get(CurrentIdentity())),
        },
        Create(Collection('bookmarks'), {
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
        bookmarkRef: Ref(Collection('bookmarks'), bookmarkId),
        bookmarks: TransformBookmarksData(
          Map(
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
        bookmarks: TransformBookmarksData(
          Map(
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

export default handler
