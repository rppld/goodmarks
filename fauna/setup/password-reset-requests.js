import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'password_reset_requests'

async function createPasswordResetRequestsCollection(client) {
  return await client.query(
    CreateCollection({
      name: COLLECTION_NAME,
    })
  )
}

async function createPasswordResetRequestsByAccountIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'password_reset_requests_by_account',
      source: Collection(COLLECTION_NAME),
      // We will search on account.
      terms: [
        {
          field: ['data', 'account'],
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

export {
  createPasswordResetRequestsCollection,
  createPasswordResetRequestsByAccountIndex,
}
