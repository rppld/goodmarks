const faunadb = require('faunadb')
const q = faunadb.query

const {
  CreateIndex,
  Collection,
  Now,
  Time,
  TimeDiff,
  Var,
  Add,
  Multiply,
  Lambda,
  Query,
  Length,
  Select,
  Subtract,
  Let,
  NGram,
  LowerCase,
  Filter,
  GT,
  Union,
} = q

function getWordParts(wordVar) {
  return Let(
    {
      indexes: q.Map(
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
      ngramsArray: q.Map(
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
              Union(getWordParts(Select(['data', 'name'], Var('user'))))
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
              // weighs up against age, setting both to one means that one like or
              // one repost is worth aging minute.
              likesFactor: 5,
              repostsFactor: 5,
              // Let's add comments as well for the sake of completeness, didn't
              // add it in the general bookmark index since comments does not mean you like it,
              // they might be out of anger :), in this case it makes sense since they are not necessarily your comments
              // The ones that are interacted with are higher up.
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
            // Adding the time since the unix timestamps
            // together with postlikes and postReposts provides us with
            // decaying popularity or a mixture of popularity and
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
                // weighs up against age, setting both to one means that one like or
                // one repost is worth aging minute.
                likesFactor: 1,
                repostsFactor: 1,
                bookmarkLikes: Select(['data', 'bookmarkLikes'], Var('stats')),
                bookmarkReposts: Select(
                  ['data', 'bookmarkReposts'],
                  Var('stats')
                ),
                txTime: Now(),
                unixStarttime: Time('1970-01-01T00:00:00+00:00'),
                ageInSecsSinceUnix: TimeDiff(
                  Var('unixStarttime'),
                  Var('txTime'),
                  'minutes'
                ),
              },
              // Adding the time since the unix timestamps
              // together with bookmarkLikes and bookmarkReposts provides us with
              // decaying popularity or a mixture of popularity and
              Add(
                Multiply(Var('likesFactor'), Var('bookmarkLikes')),
                Multiply(Var('repostsFactor'), Var('bookmarkReposts')),
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

// Used when deleting an individual comment to find out how many
// comments a user made on a particular entity.
const createCommentsByBookmarkAndAuthorOrderedIndex = CreateIndex({
  name: 'comments_by_bookmark_and_author_ordered',
  source: Collection('Comments'),
  terms: [
    {
      field: ['data', 'bookmark'],
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

async function query(client) {
  await client.query(createHashTagsAndUsersByWordpartsIndex)
}

module.exports = { query }
