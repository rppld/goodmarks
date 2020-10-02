import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection, Do, Create } = q
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

const PopulateCategories = Do(
  Create(Collection(COLLECTION_NAME), {
    data: {
      name: 'Movies',
      slug: 'movies',
    },
  }),
  Create(Collection(COLLECTION_NAME), {
    data: {
      name: 'TV shows',
      slug: 'tv-shows',
    },
  }),
  Create(Collection(COLLECTION_NAME), {
    data: {
      name: 'Links',
      slug: 'links',
    },
  })
)

export {
  createCategoriesCollection,
  createCategoriesBySlugIndex,
  PopulateCategories,
}
