import { query as q } from 'faunadb'

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
  Distinct,
} = q

function WordPartGenerator(WordVar) {
  return Let(
    {
      indexes: q.Map(
        // Reduce this array if you want less ngrams per word. Setting
        // it to [ 0 ] would only create the word itself, Setting it
        // to [0, 1] would result in the word itself and all ngrams
        // that are one character shorter, etc..
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        Lambda('index', Subtract(Length(WordVar), Var('index')))
      ),
      indexesFiltered: Filter(
        Var('indexes'),
        // filter out the ones below 0
        Lambda('l', GT(Var('l'), 0))
      ),
      ngramsArray: q.Map(
        Var('indexesFiltered'),
        Lambda('l', NGram(LowerCase(WordVar), Var('l'), Var('l')))
      ),
    },
    Var('ngramsArray')
  )
}

const CreateHashtagsAndUsersByWordpartsWithBinding = CreateIndex({
  name: 'collections_and_users_by_wordparts',
  // we actually want to sort to get the shortest word that matches
  // first.
  source: [
    {
      // If your collections have the same property tht you want to
      // access you can pass a list to the collection.
      collection: [Collection('Collections'), Collection('Users')],
      fields: {
        length: Query(
          Lambda(
            'collectionOrUser',
            Length(Select(['data', 'name'], Var('collectionOrUser')))
          )
        ),
        wordparts: Query(
          Lambda(
            'collectionOrUser',
            Distinct(
              Union(
                WordPartGenerator(
                  Select(['data', 'name'], Var('collectionOrUser'))
                )
              )
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
      Exists(Index('collections_and_users_by_wordparts')),
      true,
      CreateHashtagsAndUsersByWordpartsWithBinding
    )
  )
}

async function deleteSearchIndexes(client) {
  await client.query(
    If(
      Exists(Index('collections_and_users_by_wordparts')),
      true,
      Delete(Index('collections_and_users_by_wordparts'))
    )
  )
}

export { createSearchIndexes, deleteSearchIndexes }
