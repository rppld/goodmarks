import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'lists'

async function createListsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createListsByAuthorIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'lists_by_author',
      source: Collection(COLLECTION_NAME),
      // We will search on author.
      terms: [
        {
          field: ['data', 'author'],
        },
      ],
      values: [
        {
          // We want the results to be sorted on creation time
          field: ['data', 'created'],
          reverse: true,
        },
        {
          field: ['ref'], // return the fweet reference
        },
      ],
      serialized: true,
    })
  )
}

async function createListsByAuthorAndPrivateIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'lists_by_author_and_private',
      source: Collection(COLLECTION_NAME),
      terms: [
        {
          field: ['data', 'author'],
        },
        {
          field: ['data', 'private'],
        },
      ],
      values: [
        {
          // We want the results to be sorted on creation time
          field: ['data', 'created'],
          reverse: true,
        },
        {
          field: ['ref'], // return the fweet reference
        },
      ],
      serialized: true,
    })
  )
}

async function createListsByReferenceIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'lists_by_reference',
      source: Collection(COLLECTION_NAME),
      // This is the default collection index, no terms or values are
      // provided which means the index will sort by reference and
      // return only the reference.
      terms: [
        {
          field: ['ref'],
        },
      ],
      values: [
        {
          field: ['ref'],
        },
        {
          field: ['data', 'name'],
        },
        {
          field: ['data', 'author'],
        },
      ],
      serialized: true,
    })
  )
}

export {
  createListsCollection,
  createListsByAuthorIndex,
  createListsByAuthorAndPrivateIndex,
  createListsByReferenceIndex,
}
