import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'list_items'

async function createListItemsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createListItemsByListIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'list_items_by_list',
      source: Collection(COLLECTION_NAME),
      // We will search on list.
      terms: [
        {
          field: ['data', 'list'],
        },
      ],
      values: [
        {
          field: ['data', 'created'],
        },
        {
          field: ['data', 'object'],
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

async function createListItemsByListAndObjectIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'list_items_by_list_and_object',
      source: Collection(COLLECTION_NAME),
      // We will search on list.
      terms: [
        {
          field: ['data', 'list'],
        },
        {
          field: ['data', 'object'],
        },
      ],
      values: [
        {
          field: ['data', 'created'],
        },
        {
          field: ['data', 'object'],
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

export {
  createListItemsCollection,
  createListItemsByListIndex,
  createListItemsByListAndObjectIndex,
}
