import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'comments'

async function createCommentsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createCommentsByObjectAndAuthorOrdered(client) {
  // Used when deleting an individual comment to find out how many
  // comments a user made on a particular entity.
  return await client.query(
    CreateIndex({
      name: 'comments_by_object_and_author_ordered',
      source: Collection(COLLECTION_NAME),
      terms: [
        {
          field: ['data', 'object'],
        },
        {
          field: ['data', 'author'],
        },
      ],
      values: [
        {
          field: ['ref'],
        },
      ],
      // We'll be using these indexes in the logic of our application so
      // it's safer to set serialized to true That way reads will always
      // reflect the previous writes.
      serialized: true,
    })
  )
}

async function createCommentsByObjectOrdered(client) {
  // Used when deleting an individual comment to find out how many
  // comments a user made on a particular entity.
  return await client.query(
    CreateIndex({
      name: 'comments_by_object_ordered',
      source: Collection(COLLECTION_NAME),
      terms: [
        {
          field: ['data', 'object'],
        },
      ],
      values: [
        // By including the 'created' we order them by time.
        {
          // In contrary to hte bookmarks index where we used reverse: true,
          // comments need to go in the regular order.
          field: ['data', 'created'],
        },
        {
          field: ['ref'],
        },
      ],
      // We'll be using these indexes in the logic of our application so
      // it's safer to set serialized to true That way reads will always
      // reflect the previous writes.
      serialized: true,
    })
  )
}

export {
  createCommentsCollection,
  createCommentsByObjectAndAuthorOrdered,
  createCommentsByObjectOrdered,
}
