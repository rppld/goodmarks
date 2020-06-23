import faunadb, { query as q } from 'faunadb'
import cookie from 'cookie'

export const FAUNA_SECRET_COOKIE = 'faunaSecret'

export const serverClient = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
})

// Used for any authed requests.
export const faunaClient = (secret) =>
  new faunadb.Client({
    secret,
  })

export const serializeFaunaCookie = (userSecret) => {
  return cookie.serialize(FAUNA_SECRET_COOKIE, userSecret, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })
}

export function flattenDataKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((e) => flattenDataKeys(e))
  } else if (typeof obj === 'object') {
    // The case where we have just data pointing to an array.
    if (Object.keys(obj).length === 1 && obj.data && Array.isArray(obj.data)) {
      return flattenDataKeys(obj.data)
    } else {
      Object.keys(obj).forEach((k) => {
        if (k === 'ref') {
          // Return plain `id` instead of `ref` object.
          const r = obj[k]
          delete obj.ref
          obj['id'] = r.id
        }
        if (k === 'data') {
          const d = obj[k]
          delete obj.data

          Object.keys(d).forEach((dataKey) => {
            obj[dataKey] = flattenDataKeys(d[dataKey])
          })
        } else {
          obj[k] = flattenDataKeys(obj[k])
        }
      })
    }
    return obj
  } else {
    return obj
  }
}

const {
  Create,
  Collection,
  HasIdentity,
  Select,
  Get,
  Identity,
  Contains,
  Paginate,
  Let,
  Lambda,
  Var,
  Exists,
  Match,
  Index,
  If,
} = q

export async function createHashtags(items) {
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

export function getBookmarksWithUsersMapGetGeneric(
  bookmarksSetRefOrArray,
  depth = 1
) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    // For all bookmarks this is just
    // Paginate(Documents(Collection('Bookmarks'))), else it's a match
    // on an index.
    bookmarksSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          bookmark: If(Exists(Var('ref')), Get(Var('ref')), false),
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
          category: If(
            Exists(Var('ref')),
            Get(Select(['data', 'category'], Var('bookmark'))),
            false
          ),
          // Get the user that wrote the bookmark.
          user: If(
            Exists(Var('ref')),
            Get(Select(['data', 'author'], Var('bookmark'))),
            false
          ),
          // Get the account via identity.
          account: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('account')),
            false
          ),
          // Get the statistics for the bookmark
          bookmarkStatsMatch: If(
            Exists(Var('ref')),
            Match(
              Index('bookmark_stats_by_user_and_bookmark'),
              Var('currentUserRef'),
              Select(['ref'], Var('bookmark'))
            ),
            false
          ),
          followerStatsMatch: If(
            Exists(Var('ref')),
            Match(
              Index('follower_stats_by_author_and_follower'),
              Var('currentUserRef'),
              Select(['ref'], Var('bookmark'))
            ),
            false
          ),
          bookmarkStats: If(
            Exists(Var('ref')),
            If(
              Exists(Var('bookmarkStatsMatch')),
              Get(Var('bookmarkStatsMatch')),
              {}
            ),
            false
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

export function getListsWithUsersMapGetGeneric(listsSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    // For all lists this is just
    // Paginate(Documents(Collection('Lists'))), else it's a match
    // on an index.
    listsSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          list: If(Exists(Var('ref')), Get(Var('ref')), false),
          // Get the original list
          original: If(
            Contains(['data', 'original'], Var('list')),
            // Reposted list. Get original list's data. We
            // want to get the original as well in the same structure,
            // let's just use recursion to construct that query, we
            // could get the whole repost chain like this, it looks a
            // bit like traversing a graph. We are only interested in
            // the first reposted list so we pas depth 1 as
            // default, depth is meant to make sure sure we don't loop
            // endelessly in javascript.
            depth > 0
              ? Select(
                  [0],
                  getListsWithUsersMapGetGeneric(
                    [Select(['data', 'original'], Var('list'))],
                    depth - 1
                  )
                )
              : false,
            // Normal list, there is no original.
            false
          ),
          items: q.Map(
            Select(['data', 'items'], Var('list')),
            q.Lambda('item', {
              id: Select(['id'], Var('item')),
              bookmark: Select(
                0,
                getBookmarksWithUsersMapGetGeneric([
                  Select(['ref'], Var('item')),
                ])
              ),
            })
          ),
          // Get the user that wrote the list.
          user: Get(Select(['data', 'author'], Var('list'))),
          // Get the account via identity.
          account: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('account')),
            false
          ),
          // Get the statistics for the list
          listStatsMatch: Match(
            Index('list_stats_by_user_and_list'),
            Var('currentUserRef'),
            Select(['ref'], Var('list'))
          ),
          followerStatsMatch: Match(
            Index('follower_stats_by_author_and_follower'),
            Var('currentUserRef'),
            Select(['ref'], Var('list'))
          ),
          listStats: If(
            Exists(Var('listStatsMatch')),
            Get(Var('listStatsMatch')),
            {}
          ),
          // Get comments, index has two values so lambda has two values
          comments: q.Map(
            Paginate(Match(Index('comments_by_list_ordered'), Var('ref'))),
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
          list: Var('list'),
          items: Var('items'),
          listStats: Var('listStats'),
          comments: Var('comments'),
        }
      )
    )
  )
}
