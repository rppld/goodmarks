import { query as q } from 'faunadb'

const { CreateCollection, Collection, CreateIndex, Tokens } = q
const COLLECTION_NAME = 'accounts'

async function createAccountCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createAllAccountsIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'all_accounts',
      source: Collection(COLLECTION_NAME),
      // This is the default collection index, no terms or values are
      // provided which means the index will sort by reference and
      // return only the reference.
      serialized: true,
    })
  )
}

async function createAccountsByEmailIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'accounts_by_email',
      source: Collection(COLLECTION_NAME),
      // We will search on email.
      terms: [
        {
          field: ['data', 'email'],
        },
      ],
      // If no values are added, the index will just return the
      // reference. Prevent that accounts with duplicate e-mails are
      // made. uniqueness works on the combination of terms/values.
      unique: true,
      serialized: true,
    })
  )
}

async function createTokensByInstanceIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'tokens_by_instance',
      source: Tokens(),
      terms: [
        {
          field: ['instance'],
        },
      ],
      unique: false,
      serialized: true,
    })
  )
}

export {
  createAccountCollection,
  createAllAccountsIndex,
  createAccountsByEmailIndex,
  createTokensByInstanceIndex,
}
