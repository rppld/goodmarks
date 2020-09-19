import { query as q } from 'faunadb'

const {
  Collection,
  CreateIndex,
  Query,
  Lambda,
  Length,
  Select,
  Var,
  Union,
  Let,
  Subtract,
  Filter,
  GT,
  NGram,
  LowerCase,
  Map,
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

async function createHashtagsAndUsersByWordpartsIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'hashtags_and_users_by_wordparts',
      // We actually want to sort to get the shortest word that
      // matches first.
      source: [
        {
          collection: Collection('hashtags'),
          fields: {
            length: Query(
              Lambda(
                'hashtag',
                Length(Select(['data', 'name'], Var('hashtag')))
              )
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
          collection: Collection('users'),
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
                  // @todo: `name` can be undefined, but I couldn’t find a
                  // way to check for that. I’m passing a random string
                  // `@` as default value for `Select()` in this case,
                  // which isn’t ideal but good enough I guess. It means
                  // that searching for `@` will return all results from
                  // the collection, but let’s block that by requiring a
                  // minimum term-length on the client before a call to
                  // the endpoint is made.
                  Union(
                    getWordParts(Select(['data', 'name'], Var('user'), '@'))
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
  )
}

export { createHashtagsAndUsersByWordpartsIndex }
