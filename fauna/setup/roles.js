import { query as q } from 'faunadb'
import { CreateOrUpdateRole } from '../helpers/fql'

const {
  Collection,
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

export { createPasswordResetRequestRole, createAccountVerificationRole }
