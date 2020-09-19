import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'categories'

async function createCategoriesCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createCategoriesBySlugIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'categories_by_slug',
      source: Collection(COLLECTION_NAME),
      // We will search on slug.
      terms: [
        {
          field: ['data', 'slug'],
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

export { createCategoriesCollection, createCategoriesBySlugIndex }
