import { query as q } from 'faunadb'

const {
  CreateCollection,
  CreateIndex,
  Collection,
  Query,
  Lambda,
  Let,
  Var,
  Select,
  Now,
  Time,
  TimeDiff,
  Add,
  Multiply,
  Subtract,
  Sqrt,
  Divide,
} = q
const COLLECTION_NAME = 'bookmarks'

async function createBookmarksCollection(client) {
  return await client.query(CreateCollection({ name: COLLECTION_NAME }))
}

async function createAllBookmarksIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'all_bookmarks',
      source: Collection(COLLECTION_NAME),
      values: [
        {
          field: ['data', 'created'],
          reverse: true,
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

async function createBookmarksByAuthorIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'bookmarks_by_author',
      source: Collection(COLLECTION_NAME),
      terms: [
        {
          field: ['data', 'author'],
        },
      ],
      values: [
        {
          // We want the results to be sorted on creation time.
          field: ['data', 'created'],
          reverse: true,
        },
        {
          field: ['ref'], // Return the bookmark reference.
        },
      ],
      serialized: true,
    })
  )
}

function BookmarkScore(bookmarkRef) {
  return Let(
    {
      // The popularityfactor determines how much popularity
      // weighs up against age, setting both to one means that
      // one like or one repost is worth aging minute.
      likesFactor: 5,
      repostsFactor: 5,
      // Let's add comments as well for the sake of
      // completeness, didn't add it in the general bookmark
      // index since comments does not mean you like it, they
      // might be out of anger :), in this case it makes sense
      // since they are not necessarily your comments The ones
      // that are interacted with are higher up.
      commentsFactor: 5,
      likes: Select(['data', 'likes'], bookmarkRef),
      comments: Select(['data', 'comments'], bookmarkRef),
      reposts: Select(['data', 'reposts'], bookmarkRef),
      txTime: Now(),
      unixStartTime: Time('1970-01-01T00:00:00+00:00'),
      ageInSecsSinceUnix: TimeDiff(
        Var('unixStartTime'),
        Var('txTime'),
        'minutes'
      ),
    },
    // Adding the time since the unix timestamps together with
    // postlikes and postReposts provides us with decaying
    // popularity or a mixture of popularity and
    Add(
      Multiply(Var('likesFactor'), Var('likes')),
      Multiply(Var('repostsFactor'), Var('reposts')),
      Multiply(Var('commentsFactor'), Var('comments')),
      Var('ageInSecsSinceUnix')
    )
  )
}

async function createBookmarksByHashtagIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'bookmarks_by_hashtag',
      source: {
        collection: Collection(COLLECTION_NAME),
        fields: {
          bookmarkScore: Query(
            Lambda('bookmark', BookmarkScore(Var('bookmark')))
          ),
        },
      },
      terms: [
        {
          field: ['data', 'hashtags'],
        },
      ],
      values: [
        {
          binding: 'bookmarkScore',
          reverse: true,
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

function BookmarkRanking(bookmarkRef) {
  return Let(
    {
      commentsFactor: 0.08,
      likes: Select(['data', 'likes'], bookmarkRef),
      comments: Select(['data', 'comments'], bookmarkRef),
      reposts: Select(['data', 'reposts'], bookmarkRef),
      created: Select(['data', 'created'], bookmarkRef),
      unixStartTime: Time('1970-01-01T00:00:00+00:00'),
      createdDiff: TimeDiff(
        Var('unixStartTime'),
        Var('created'),
        'microseconds'
      ),
      score: Add(
        Var('likes'),
        Var('reposts'),
        Multiply(Var('comments'), Var('commentsFactor')),
        0.75
      ),
      decay: Subtract(
        1,
        Sqrt(Multiply(Divide(Var('createdDiff'), 14400000000), 0.000004))
      ),
    },
    Divide(Var('score'), Var('decay'))
  )
}

async function createBookmarksByRankingIndex(client) {
  // Based on “Designing and Implementing a Ranking Algorithm”
  // https://bit.ly/3eULrJk
  return await client.query(
    CreateIndex({
      name: 'bookmarks_by_ranking',
      source: {
        collection: Collection(COLLECTION_NAME),
        fields: {
          bookmarkRanking: Query(
            Lambda('bookmark', BookmarkRanking(Var('bookmark')))
          ),
        },
      },
      values: [
        {
          binding: 'bookmarkRanking',
          reverse: true,
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

async function createBookmarksByReferenceIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'bookmarks_by_reference',
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
          field: ['data', 'message'],
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
  createBookmarksCollection,
  createAllBookmarksIndex,
  createBookmarksByAuthorIndex,
  createBookmarksByHashtagIndex,
  createBookmarksByRankingIndex,
  createBookmarksByReferenceIndex,
}
