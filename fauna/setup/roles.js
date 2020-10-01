import { query as q } from 'faunadb'
import { CreateOrUpdateRole } from '../helpers/fql'

const {
  Collection,
  Index,
  Query,
  Lambda,
  Not,
  Equals,
  Select,
  Get,
  Var,
  And,
  Let,
  Merge,
  Filter,
  Any,
  All,
  Identity,
  If,
  ToArray,
  Credentials,
} = q

async function createLoggedInRole(client) {
  return await client.query(
    CreateOrUpdateRole({
      name: 'membershiprole_loggedin',
      membership: [{ resource: Collection('accounts') }],
      privileges: [
        {
          resource: Collection('bookmarks'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Collection('users'),
          actions: {
            read: true,
            create: false,
          },
        },
        {
          resource: Collection('accounts'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('comments'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Collection('lists'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Index('all_bookmarks'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('bookmarks_by_author'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('categories_by_slug'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('categories'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('hashtags'),
          actions: {
            read: true,
            write: true,
            create: true,
          },
        },
        {
          resource: Index('hashtags_by_name'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('bookmark_stats_by_user_and_bookmark'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('users_by_handle'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('bookmarks_by_reference'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('hashtags_and_users_by_wordparts'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('follower_stats'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Index('follower_stats_by_author_and_follower'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('bookmark_stats'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Collection('list_stats'),
          actions: {
            delete: true,
            create: true,
            write: true,
            read: true,
          },
        },
        {
          resource: Index('bookmark_stats_by_bookmark'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('bookmarks_by_hashtag'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('lists_by_author'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('list_stats_by_user_and_list'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('list_stats_by_list'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('lists_by_reference'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('lists_by_author_and_private'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('follower_stats_by_user_popularity'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('bookmarks_by_ranking'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('notifications'),
          actions: {
            read: true,
            write: true,
            delete: true,
            create: true,
          },
        },
        {
          resource: Index('notifications_by_recipient'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('notifications_by_recipient_and_read_status'),
          actions: {
            read: true,
          },
        },
        {
          resource: Collection('list_items'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
          },
        },
        {
          resource: Index('list_items_by_list_and_object'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('list_items_by_list'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('tokens_by_instance'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('comments_by_object_and_author_ordered'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('comments_by_object_ordered'),
          actions: {
            read: true,
          },
        },
        {
          resource: Index('password_reset_requests_by_account'),
          actions: {
            read: true,
          },
        },
      ],
    })
  )
}

async function createPasswordResetRequestRole(client) {
  return await client.query(
    CreateOrUpdateRole({
      name: 'membershiprole_passwordreset',
      membership: [{ resource: Collection('password_reset_requests') }],
      privileges: [
        {
          resource: Collection('password_reset_requests'),
          actions: {
            // Can only read itself.
            read: Query(Lambda(['ref'], Equals(Identity(), Var('ref')))),
          },
        },
        {
          resource: Credentials(),
          actions: {
            write: true,
            create: true,
          },
        },
        {
          resource: Collection('accounts'),
          actions: {
            // Can only read accounts that the verification is created for.
            read: Query(
              Lambda(
                ['ref'],
                Let(
                  {
                    // Identity is in this case a document of the accounts_verification_request collection
                    // since we are using a token generated for such a document.
                    // The document has an account reference stored in it
                    account: Select(['data', 'account'], Get(Identity())),
                  },
                  Equals(Var('account'), Var('ref'))
                )
              )
            ),
            // And it can only change an account that the verification is created for
            write: Query(
              Lambda(
                ['oldData', 'newData', 'ref'],
                Let(
                  {
                    verification_request: Get(Identity()),
                    account: Select(['data', 'account'], Get(Identity())),
                  },
                  // Verify whether the account we write to is the same account that
                  // the token was issued for. The account we attempt to write to is the 'ref' we receive
                  // as a parameter for the write permission lambda.
                  And(
                    Equals(Var('account'), Var('ref')),
                    // Then verify that nothing else is written to the account except the
                    // new credentials
                    Not(
                      AttributesChanged(Var('oldData'), Var('newData'), [
                        'credentials',
                      ])
                    )
                  )
                )
              )
            ),
          },
        },
      ],
    })
  )
}

async function createAccountVerificationRole(client) {
  return await client.query(
    CreateOrUpdateRole({
      name: 'membershiprole_verification',
      membership: [{ resource: Collection('account_verification_requests') }],
      privileges: [
        {
          resource: Collection('account_verification_requests'),
          actions: {
            // Can only read itself.
            read: Query(Lambda(['ref'], Equals(Identity(), Var('ref')))),
          },
        },
        {
          resource: Collection('accounts'),
          actions: {
            // Can only read accounts that the verification is created for.
            read: Query(
              Lambda(
                ['ref'],
                Let(
                  {
                    // Identity is in this case a document of the accounts_verification_request collection
                    // since we are using a token generated for such a document.
                    // The document has an account reference stored in it
                    account: Select(['data', 'account'], Get(Identity())),
                  },
                  Equals(Var('account'), Var('ref'))
                )
              )
            ),
            // And it can only change an account that the verification is created for
            write: Query(
              Lambda(
                ['oldData', 'newData', 'ref'],
                Let(
                  {
                    verification_request: Get(Identity()),
                    account: Select(['data', 'account'], Get(Identity())),
                  },
                  // Verify whether the account we write to is the same account that
                  // the token was issued for. The account we attempt to write to is the 'ref' we receive
                  // as a parameter for the write permission lambda.
                  And(
                    Equals(Var('account'), Var('ref')),
                    // Then verify that nothing else is written to the account except the
                    // verification key.
                    // Top level attributes should only contain a changed data field.
                    Not(
                      AttributesChanged(Var('oldData'), Var('newData'), [
                        'data',
                      ])
                    ),
                    // and data should only have a changed verified field
                    Not(
                      AttributesChanged(
                        Var('oldData'),
                        Var('newData'),
                        ['verified'],
                        ['data']
                      )
                    )
                  )
                )
              )
            ),
          },
        },
      ],
    })
  )
}

// A helper function inspired by the excellent community-driven
// library: https://github.com/shiftx/faunadb-fql-lib
function ObjectKeys(object) {
  return q.Map(ToArray(object), Lambda(['k', 'v'], q.Var('k')))
}

// DataAttributesChanged is a pure FQL helper function that takes two
// objects and a list of attributes that can be changed between those
// two objects. We will use it in the above function to verify that
// the verification token only sets the verified boolean. We care
// about that since a verification token is sent via email which is
// not considered a secure medium. It only checks on one level at this
// point. The prefix allows you to determine which level.
function AttributesChanged(obj1, obj2, whitelist, prefix) {
  return Let(
    {
      obj1Data: prefix ? Select(prefix, obj1) : obj1,
      obj2Data: prefix ? Select(prefix, obj2) : obj2,
      merged: Merge(
        Var('obj1Data'),
        Var('obj2Data'),
        Lambda(['key', 'a', 'b'], If(Equals(Var('a'), Var('b')), true, false))
      ),
      allKeys: ObjectKeys(Var('merged')),
      // remove whitelist (the keys that can be changed)
      keys: Filter(
        Var('allKeys'),
        Lambda(
          'key',
          Not(
            Any(
              q.Map(
                whitelist,
                Lambda('whitekey', Equals(Var('whitekey'), Var('key')))
              )
            )
          )
        )
      ),
      keysChangedAddedRemoved: q.Map(
        Var('keys'),
        Lambda('key', Select([Var('key')], Var('merged')))
      ),
    },
    Not(All(Var('keysChangedAddedRemoved')))
  )
}

export {
  createLoggedInRole,
  createPasswordResetRequestRole,
  createAccountVerificationRole,
}
