import { query as q } from 'faunadb'

const { CreateCollection } = q
const COLLECTION_NAME = 'account_verification_requests'

async function createAccountVerificationRequestsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

export { createAccountVerificationRequestsCollection }
