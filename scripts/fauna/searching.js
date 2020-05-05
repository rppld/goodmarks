const faunadb = require('faunadb')
const q = faunadb.query

const {
  CreateIndex,
  Collection,
  Exists,
  If,
  Index,
  Delete,
  Lambda,
  Var,
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

const createHashtagsAndUsersByWordpartsWithBinding = CreateIndex({
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
          Lambda('user', Length(Select(['data', 'name'], Var('user'))))
        ),
        wordparts: Query(
          Lambda(
            'user',
            Union(
              // We'll search both on the name and the handle.
              // TODO: This is currently broken for users that don’t
              // have a name. For this to work, both `name` and
              // `handle` need to be defined.
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

async function createSearchIndexes(client) {
  await client.query(
    If(
      Exists(Index('hashtags_and_users_by_wordparts')),
      true,
      createHashtagsAndUsersByWordpartsWithBinding
    )
  )
}

async function deleteSearchIndexes(client) {
  await client.query(
    If(
      Exists(Index('hashtags_and_users_by_wordparts')),
      Delete(Index('hashtags_and_users_by_wordparts')),
      true
    )
  )
}

module.exports = { createSearchIndexes, deleteSearchIndexes }
