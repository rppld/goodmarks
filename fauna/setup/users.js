import { query as q } from 'faunadb'

const {
  CreateCollection,
  CreateIndex,
  Collection,
  Query,
  Lambda,
  Let,
  Select,
  Casefold,
  Var,
} = q
const COLLECTION_NAME = 'users'

async function createUsersCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createUsersByAccountIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'users_by_account',
      source: Collection(COLLECTION_NAME),
      // We will search on account.
      terms: [
        {
          field: ['data', 'account'],
        },
      ],
      values: [
        {
          field: ['ref'],
        },
        {
          field: ['data', 'account'],
        },
      ],
      unique: true,
      serialized: true,
    })
  )
}

async function createUsersByHandleIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'users_by_handle',
      source: Collection(COLLECTION_NAME),
      // We will search on handle.
      terms: [
        {
          field: ['data', 'handle'],
        },
      ],
      unique: true,
      serialized: true,
    })
  )
}

async function createUsersByNormalizedHandleIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'users_by_normalized_handle',
      source: {
        collection: Collection(COLLECTION_NAME),
        fields: {
          normalizedHandle: Query(
            Lambda(
              'user',
              Let(
                {
                  handle: Select(['data', 'handle'], Var('user')),
                  normalized: Casefold(Var('handle')),
                },
                Var('normalized')
              )
            )
          ),
        },
      },
      terms: [
        {
          binding: 'normalizedHandle',
        },
      ],
      unique: true,
      serialized: true,
    })
  )
}

export {
  createUsersCollection,
  createUsersByAccountIndex,
  createUsersByHandleIndex,
  createUsersByNormalizedHandleIndex,
}
