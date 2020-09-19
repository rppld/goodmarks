import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'list_stats'

async function createListStatsCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createListStatsByListIndex(client) {
  // Used to find related list stats when deleting a list, in order to
  // delete the stats as well.
  return await client.query(
    CreateIndex({
      name: 'list_stats_by_list',
      source: Collection(COLLECTION_NAME),
      terms: [
        {
          field: ['data', 'list'],
        },
      ],
      serialized: true,
    })
  )
}

async function createListStatsByUserAndListIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'list_stats_by_user_and_list',
      source: Collection(COLLECTION_NAME),
      // We keep a collection to store which fweets that have been
      // liked (or in a later phase refweeted) by users.

      // Wait.. Couldn't we just store this as an array i fweets?
      // { data:
      //    {
      //     likedby: [ <userid>, <userid> ]
      //    }
      // }

      // Although it's possible and you coudl index on data.likedby
      // it's not a good idea in terms of performance. This list might
      // grow to become very big which would make it hard inefficient
      // to remove an element from the list.

      terms: [
        {
          field: ['data', 'user'],
        },
        {
          field: ['data', 'list'],
        },
      ],
      serialized: true,
    })
  )
}

export {
  createListStatsCollection,
  createListStatsByListIndex,
  createListStatsByUserAndListIndex,
}
