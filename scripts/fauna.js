const faunadb = require('faunadb')
const q = faunadb.query

const {
  Map,
  CreateIndex,
  Collection,
  Now,
  Time,
  TimeDiff,
  Var,
  Sqrt,
  Add,
  Multiply,
  Lambda,
  Query,
  Length,
  Select,
  Subtract,
  Let,
  Divide,
  NGram,
  LowerCase,
  Filter,
  GT,
  Union,
} = q

function getWordParts(wordVar) {
  return Let(
    {
      indexes: Map(
        // Reduce this array if you want less ngrams per word. Setting
        // it to [0] would only create the word itself. Setting it to
        // [0, 1] would result in the word itself and all ngrams that
        // are one character shorter, etc.
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        Lambda('index', Subtract(Length(wordVar), Var('index')))
      ),
      indexesFiltered: Filter(
        Var('indexes'),
        // filter out the ones below 0
        Lambda('l', GT(Var('l'), 0))
      ),
      ngramsArray: Map(
        Var('indexesFiltered'),
        Lambda('l', NGram(LowerCase(wordVar), Var('l'), Var('l')))
      ),
    },
    Var('ngramsArray')
  )
}

const createHashTagsAndUsersByWordpartsIndex = CreateIndex({
  name: 'hashtags_and_users_by_wordparts',
  // we actually want to sort to get the shortest word that matches
  // first.
  source: [
    {
      collection: Collection('Hashtags'),
      fields: {
        length: Query(
          Lambda('hashtag', Length(Select(['data', 'name'], Var('hashtag'))))
        ),
        wordparts: Query(
          Lambda(
            'hashtag',
            Union(getWordParts(Select(['data', 'name'], Var('hashtag'))))
          )
        ),
      },
    },
    {
      collection: Collection('Users'),
      fields: {
        length: Query(
          Lambda('user', Length(Select(['data', 'handle'], Var('user'))))
        ),
        wordparts: Query(
          Lambda(
            'user',
            Union(
              // We'll search both on the name and the handle.
              Union(getWordParts(Select(['data', 'handle'], Var('user')))),
              // TODO: `name` can be undefined, but I couldn’t find a
              // way to check for that. I’m passing a random string
              // `@` as default value for `Select()` in this case,
              // which isn’t ideal but good enough I guess. It means
              // that searching for `@` will return all results from
              // the collection, but let’s block that by requiring a
              // minimum term-length on the client before a call to
              // the endpoint is made.
              Union(getWordParts(Select(['data', 'name'], Var('user'), '@')))
            )
          )
        ),
      },
    },
  ],
  terms: [
    {
      binding: 'wordparts',
    },
  ],
  // values are 'range indexed' and therefore sorted in the order you
  // provide them we will also need the reference to the actual tag!
  // We will place this second since else the elements will be sorted
  // by reference first.
  values: [
    {
      binding: 'length',
    },
    { field: ['ref'] },
  ],
  // serialized for an index that we will use for searching is not
  // necessary. false is the fault.
  serialized: false,
})

const createBookmarksByHashtagRefIndex = CreateIndex({
  name: 'bookmarks_by_hashtag_ref',
  source: Collection('Bookmarks'),
  terms: [
    {
      field: ['data', 'hashtags'],
    },
  ],
  values: [
    {
      field: ['ref'], // return the bookmark reference
    },
  ],
  serialized: true,
})

const createBookmarksByHashtagIndex = CreateIndex({
  name: 'bookmarks_by_hashtag',
  source: {
    collection: Collection('Bookmarks'),
    fields: {
      bookmarkScore: Query(
        Lambda(
          'bookmark',
          Let(
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
              likes: Select(['data', 'likes'], Var('bookmark')),
              comments: Select(['data', 'comments'], Var('bookmark')),
              reposts: Select(['data', 'reposts'], Var('bookmark')),
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
        )
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

// Based on “Designing and Implementing a Ranking Algorithm”
// https://bit.ly/3eULrJk
const createBookmarksByRankingIndex = CreateIndex({
  name: 'bookmarks_by_ranking',
  source: {
    collection: Collection('Bookmarks'),
    fields: {
      bookmarkRanking: Query(
        Lambda(
          'bookmark',
          Let(
            {
              commentsFactor: 0.08,
              likes: Select(['data', 'likes'], Var('bookmark')),
              comments: Select(['data', 'comments'], Var('bookmark')),
              reposts: Select(['data', 'reposts'], Var('bookmark')),
              created: Select(['data', 'created'], Var('bookmark')),
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
                Sqrt(
                  Multiply(Divide(Var('createdDiff'), 14400000000), 0.000004)
                )
              ),
            },
            Divide(Var('score'), Var('decay'))
          )
        )
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

const createBookmarksByPopularityIndex = CreateIndex({
  name: 'bookmarks_by_popularity',
  source: {
    collection: Collection('Bookmarks'),
    fields: {
      bookmarkRanking: Query(
        Lambda(
          'bookmark',
          Let(
            {
              // The popularityfactor determines how much popularity
              // weighs up against age, setting both to one means that
              // one like or one refweet is worth aging minute.
              likesfactor: 5,
              repostsfactor: 5,
              // Let's add comments as well for the sake of
              // completeness, didn't add it in the general fweet
              // index since comments does not mean you like it, they
              // might be out of anger :), in this case it makes sense
              // since they are not necessarily your comments The ones
              // that are interacted with are higher up.
              commentsFactor: 0.08,
              likes: Select(['data', 'likes'], Var('bookmark')),
              comments: Select(['data', 'comments'], Var('bookmark')),
              reposts: Select(['data', 'reposts'], Var('bookmark')),
              txtime: Now(),
              unixstarttime: Time('1970-01-01T00:00:00+00:00'),
              ageInSecsSinceUnix: TimeDiff(
                Var('unixstarttime'),
                Var('txtime'),
                'minutes'
              ),
            },
            // Adding the time since the unix timestamps together with
            // postlikes and postreposts provides us with decaying
            // popularity or a mixture of popularity and
            Add(
              Multiply(Var('likesfactor'), Var('likes')),
              Multiply(Var('repostsfactor'), Var('reposts')),
              Multiply(Var('commentsFactor'), Var('comments')),
              Var('ageInSecsSinceUnix')
            )
          )
        )
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

const createCommentsByListOrderedIndex = CreateIndex({
  name: 'comments_by_list_ordered',
  source: Collection('Comments'),
  terms: [
    {
      field: ['data', 'list'],
    },
  ],
  values: [
    // By including the 'ts' we order them by time.
    {
      // In contrary to hte bookmarks index where we used reverse: true,
      // comments need to go in the regular order.
      field: ['ts'],
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

// Used to find related bookmark stats when deleting a bookmark, in
// order to delete the stats as well.
const createBookmarkStatsByBookmarkIndex = CreateIndex({
  name: 'bookmark_stats_by_bookmark',
  source: Collection('BookmarkStats'),
  terms: [
    {
      field: ['data', 'bookmark'],
    },
  ],
  serialized: true,
})

const createFollowerStatsByUserPopularityIndex = CreateIndex({
  name: 'follower_stats_by_user_popularity',
  source: [
    {
      collection: Collection('FollowerStats'),
      fields: {
        bookmarkScore: Query(
          Lambda(
            'stats',
            Let(
              {
                // The popularityfactor determines how much popularity
                // weighs up against age, setting both to one means
                // that one like or one repost is worth aging minute.
                likesFactor: 1,
                repostsFactor: 1,
                postLikes: Select(['data', 'postLikes'], Var('stats')),
                postReposts: Select(['data', 'postReposts'], Var('stats')),
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
          )
        ),
      },
    },
  ],
  terms: [
    {
      // We search by follower first since the follower is the current
      // user who wants to retrieve his feed of bookmark.
      field: ['data', 'follower'],
    },
  ],
  values: [
    {
      binding: 'bookmarkScore',
      reverse: true,
    },
    {
      field: ['data', 'author'],
    },
  ],
})

const createNotificationsByRecipientIndex = CreateIndex({
  name: 'notifications_by_recipient',
  source: Collection('Notifications'),
  terms: [
    {
      field: ['data', 'recipient'],
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

const createNotificationsByRecipientAndReadStatusIndex = CreateIndex({
  name: 'notifications_by_recipient_and_read_status',
  source: Collection('Notifications'),
  terms: [
    {
      field: ['data', 'recipient'],
    },
    {
      field: ['data', 'read'],
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

// Used when deleting an individual comment to find out how many
// comments a user made on a particular entity.
const createCommentsByBookmarkAndAuthorOrderedIndex = CreateIndex({
  name: 'comments_by_object_and_author_ordered',
  source: Collection('Comments'),
  terms: [
    {
      field: ['data', 'object'],
    },
    {
      field: ['data', 'author'],
    },
  ],
  values: [
    // By including the 'ts' we order them by time.
    {
      // In contrary to hte fweets index where we used reverse: true,
      // comments need to go in the regular order.
      field: ['ts'],
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

const createListsByAuthorAndPrivateIndex = CreateIndex({
  name: 'lists_by_author_and_private',
  source: Collection('Lists'),
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

async function query(client) {
  await client.query(createListsByAuthorAndPrivateIndex)
}

module.exports = { query }
