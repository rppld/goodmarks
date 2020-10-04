import faunadb, { query as q } from 'faunadb'
import { parseJSON } from 'faunadb/src/_json'
import cookie from 'cookie'
import atob from 'atob'
import btoa from 'btoa'
import { Notification } from './types'

const ACCESS_TOKEN_LIFETIME_SECONDS = 600 // 10 minutes
const RESET_TOKEN_LIFETIME_SECONDS = 1800 // 30 minutes
const REFRESH_TOKEN_LIFETIME_SECONDS = 28800 // 8 hours

export const FAUNA_SECRET_COOKIE = 'goodmarks_app_secret'

export const serverClient = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
})

export const serialize = (value) => {
  return btoa(JSON.stringify(value))
}

export const parseValue = (value) => {
  return parseJSON(atob(value))
}

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

const {
  Map,
  Create,
  Collection,
  HasIdentity,
  Do,
  Delete,
  Select,
  Get,
  Identity,
  ContainsPath,
  Paginate,
  Let,
  Lambda,
  Var,
  Exists,
  Match,
  Index,
  IsNull,
  If,
  Now,
  Tokens,
  TimeAdd,
  Update,
  Logout,
} = q

export function CreatePasswordResetToken(accountRef) {
  return Let(
    {
      // If we create a token in a specific collection, we can more
      // easily control with roles what the token can do.
      reset_request: Create(Collection('password_reset_requests'), {
        data: {
          account: accountRef,
        },
      }),
    },
    // Create a token that will provide the permissions of the
    // accounts_verification_request document. The account is linked
    // to it in the document which will be used in the roles to verify
    // the acount.
    Create(Tokens(), {
      instance: Select(['ref'], Var('reset_request')),
      ttl: TimeAdd(Now(), RESET_TOKEN_LIFETIME_SECONDS, 'seconds'),
    })
  )
}

export function InvalidateResetTokens(accountRef) {
  return Let(
    {
      resetRequests: Paginate(
        Match(Index('password_reset_requests_by_account'), accountRef)
      ),
      resetTokens: q.Map(
        Var('resetRequests'),
        // there should always only be one, hence we can do the
        // Select([0], ...) to get the first reference
        Lambda(
          ['req'],
          Select(
            [0],
            Paginate(Match(Index('tokens_by_instance'), Var('req'))),
            null // Return null if token is expired.
          )
        )
      ),
    },
    // We'll delete both the documents and the tokens in this case to
    // make sure we don't end up going through a larger list if
    // someone resets a lot.
    Do(
      q.Map(
        Var('resetTokens'),
        Lambda(['token'], If(IsNull(Var('token')), false, Delete(Var('token'))))
      ),
      q.Map(
        Var('resetRequests'),
        Lambda(['resetRequest'], Delete(Var('resetRequest')))
      )
    )
  )
}

export function CreateEmailVerificationToken(accountRef) {
  return Let(
    {
      // First create a document in a collection specifically provided
      // for email verification tokens. If we create a token in a
      // specific collection, we can more easily control with roles
      // what the token can do.
      verification_request: Create(
        Collection('account_verification_requests'),
        {
          data: {
            account: accountRef,
          },
        }
      ),
    },
    // Create a token that will provide the permissions of the
    // account_verification_requests document. The account is linked
    // to it in the document which will be used in the roles to verify
    // the account.
    Create(Tokens(), {
      instance: Select(['ref'], Var('verification_request')),
    })
  )
}

// The verification will be called using the verifyToken that was
// created in the previous function. That token has the rights to
// set an account's verified boolean to true.
export function VerifyRegisteredAccount() {
  return Let(
    {
      // Identity is a document from the 'account_verification_requests' collection
      accountRef: Select(['data', 'account'], Get(Identity())),
      account: Update(Var('accountRef'), {
        data: {
          verified: true,
        },
      }),
      // Remove the verification token! Without passing 'true' to Logout
      // only this specific token will be removed.
      logout: Logout(false),
      // We could opt here to delete the verification request as well.
      // however we keep it around for logging purposes.
    },
    Var('account')
  )

  // And of course we want to add rate-limiting first. The rate
  // limiting config for login contains calls: 3 and perSeconds: 0
  // (see './rate-limiting.js) 0 means that there is no decay, no
  // matter how long you wait you can do maximum 3 calls. But on
  // successful login we clean up the rate-limiting so they only
  // remain on failed logins.
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

export function CreateNotification(
  payload: Omit<Notification, 'id' | 'created' | 'read'>
) {
  return Create(Collection('notifications'), {
    data: {
      ...payload,
      created: Now(),
      read: false,
    },
  })
}

export async function CreateHashtags(items) {
  // items is an array that looks like:
  // [{ name: 'hash' }, { name: 'tag' }]
  return Map(
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
            Create(Collection('hashtags'), {
              data: { name: Var('hashtag') },
            })
          )
        )
      )
    )
  )
}

export function TransformBookmarksData(bookmarksSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return Map(
    // For all bookmarks this is just
    // Paginate(Documents(Collection('bookmarks'))), else it's a match
    // on an index.
    bookmarksSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          bookmark: If(Exists(Var('ref')), Get(Var('ref')), false),
          // Get the original bookmark
          original: If(
            ContainsPath(['data', 'original'], Var('bookmark')),
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
                  TransformBookmarksData(
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
          author: If(
            Exists(Var('ref')),
            Get(Select(['data', 'author'], Var('bookmark'))),
            false
          ),
          // Get the account via identity.
          currentUserAccount: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('currentUserAccount')),
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
          comments: Map(
            Paginate(Match(Index('comments_by_object_ordered'), Var('ref'))),
            Lambda(
              ['createdTime', 'commentRef'],
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
          author: Var('author'),
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

export function TransformNotificationsData(setRefOrArray) {
  return Map(
    setRefOrArray,
    Lambda((ref) =>
      Let(
        {
          id: Select(['id'], Var('ref')),
          notification: Get(Var('ref')),
          type: Select(['data', 'type'], Var('notification')),
          sender: Select(['data', 'sender'], Var('notification')),
          senderHandle: Select(['data', 'handle'], Get(Var('sender'))),
          objectRef: Select(['data', 'object'], Var('notification')),
          object: If(Exists(Var('objectRef')), Get(Var('objectRef')), false),
          objectId: Select(['id'], Var('objectRef')),
          objectType: Select(['data', 'objectType'], Var('notification')),
          text: Select(['data', 'text'], Var('object'), false),
          read: Select(['data', 'read'], Var('notification')),
        },
        {
          id: Var('id'),
          notification: Var('notification'),
          type: Var('type'),
          senderHandle: Var('senderHandle'),
          objectId: Var('objectId'),
          objectType: Var('objectType'),
          text: Var('text'),
          read: Var('read'),
        }
      )
    )
  )
}

export function TransformListsData(listsSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return Map(
    // For all lists this is just
    // Paginate(Documents(Collection('lists'))), else it's a match
    // on an index.
    listsSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          list: If(Exists(Var('ref')), Get(Var('ref')), false),
          // Get the original list
          original: If(
            ContainsPath(['data', 'original'], Var('list')),
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
                  TransformListsData(
                    [Select(['data', 'original'], Var('list'))],
                    depth - 1
                  )
                )
              : false,
            // Normal list, there is no original.
            false
          ),
          // Get the user that wrote the list.
          author: Get(Select(['data', 'author'], Var('list'))),
          // Get the account via identity.
          currentUserAccount: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('currentUserAccount')),
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
        },
        // Return our elements
        {
          author: Var('author'),
          original: Var('original'),
          list: Var('list'),
          listStats: Var('listStats'),
        }
      )
    )
  )
}
