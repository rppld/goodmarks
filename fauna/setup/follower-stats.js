import { query as q } from 'faunadb'

const {
  CreateCollection,
  Collection,
  CreateIndex,
  Query,
  Lambda,
  Let,
  Select,
  Now,
  Var,
  Time,
  TimeDiff,
  Add,
  Multiply,
} = q
const COLLECTION_NAME = 'follower_stats'

async function createFollowerStatsCollection(client) {
  return await client.query(
    CreateCollection({
      name: COLLECTION_NAME,
    })
  )
}

async function createFollowerStatsByAuthorAndFollowerIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'follower_stats_by_author_and_follower',
      source: Collection(COLLECTION_NAME),
      // We keep a collection to store which users are followed by
      // other users. Wait.. Couldn't we just store this as an array
      // in users?

      // { data:
      //    {
      //     followedby: [ <userid>, <userid> ]
      //    }
      // }

      // Although it's possible and you could index on data.followedby
      // it's not a good idea in terms of performance. This list might
      // grow to become very big which would make it hard inefficient
      // to remove an element from the list.
      terms: [
        {
          field: ['data', 'author'],
        },
        {
          field: ['data', 'follower'],
        },
      ],
      // We don't want to have the same person following the same
      // author multiple times of course! unique makes sure that the
      // combination of 'follower' and 'author' is unique.
      unique: true,
      serialized: true,
    })
  )
}

function UserPopularity(statsRef) {
  return Let(
    {
      // The popularityfactor determines how much popularity
      // weighs up against age, setting both to one means
      // that one like or one repost is worth aging minute.
      likesFactor: 1,
      repostsFactor: 1,
      postLikes: Select(['data', 'postLikes'], statsRef),
      postReposts: Select(['data', 'postReposts'], statsRef),
      txTime: Now(),
      unixStarttime: Time('1970-01-01T00:00:00+00:00'),
      ageInSecsSinceUnix: TimeDiff(
        Var('unixStarttime'),
        Var('txTime'),
        'minutes'
      ),
    },
    // Adding the time since the unix timestamps
    // together with postLikes and postReposts provides us with
    // decaying popularity or a mixture of popularity and
    Add(
      Multiply(Var('likesFactor'), Var('postLikes')),
      Multiply(Var('repostsFactor'), Var('postReposts')),
      Var('ageInSecsSinceUnix')
    )
  )
}

async function createFollowerStatsByUserPopularity(client) {
  return await client.query(
    CreateIndex({
      name: 'follower_stats_by_user_popularity',
      source: [
        {
          collection: Collection(COLLECTION_NAME),
          fields: {
            userPopularity: Query(
              Lambda('stats', UserPopularity(Var('stats')))
            ),
          },
        },
      ],
      terms: [
        {
          // We search by follower first since the follower is the current
          // user who wants to retrieve his feed of bookmarks.
          field: ['data', 'follower'],
        },
      ],
      values: [
        {
          binding: 'userPopularity',
          reverse: true,
        },
        {
          field: ['data', 'author'],
        },
      ],
    })
  )
}

export {
  createFollowerStatsCollection,
  createFollowerStatsByAuthorAndFollowerIndex,
  createFollowerStatsByUserPopularity,
}
