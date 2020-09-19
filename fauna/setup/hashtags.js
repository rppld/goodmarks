import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'hashtags'

async function createHashtagsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createHashtagsByNameIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'hashtags_by_name',
      source: Collection(COLLECTION_NAME),
      // this is the default collection index, no terms or values are
      // provided which means the index will sort by reference and
      // return only the reference.
      terms: [
        {
          field: ['data', 'name'],
        },
      ],
      // We do not want multiple hashtask with the same name.
      // Uniqueness is defined by the combination of terms/values. By
      // default an index returns references byt if you would add
      // 'ref' as a value here it would validate the uniqueness of the
      // name, ref tuple which is always unique due to ref.
      unique: true,
      // Since we want to be sure to find hashtags when we click on
      // them we make sure the index is serialized. Serialized means
      // that your writes will be immediately available if you read
      // the index afterwards.
      serialized: true,
    })
  )
}

export { createHashtagsCollection, createHashtagsByNameIndex }
