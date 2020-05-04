import { query as q } from 'faunadb'
import { serverClient } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import fetch from 'isomorphic-unfetch'

const {
  Match,
  Paginate,
  Index,
  Lambda,
  Let,
  Var,
  Get,
  Select,
  Ref,
  Collection,
} = q

export default async (...args) => {
  const { context } = args[0].query

  if (context === 'movie' || context === 'tv') {
    return searchTMDb(...args, context)
  }

  if (context === 'user') {
    return searchUser(...args)
  }

  if (context === 'hashtags_and_users') {
    return searchHashtagsAndUsers(...args)
  }

  return args[1].status(400).send('No context defined')
}

async function searchTMDb(req, res, context) {
  const { term } = req.query
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    query: term,
    page: '1',
    include_adult: false,
  })
  const url = `https://api.themoviedb.org/3/search/${context}?${params.toString()}`
  const data = await fetch(url)
  const json = await data.json()
  return res.status(200).json(json.results)
}

async function searchUser(req, res) {
  const { name } = req.query

  const data = await serverClient.query(
    Let(
      {
        setRef: Match(Index('users_by_name'), name.toLowerCase()),
        userRef: Select(0, Paginate(Var('setRef'), { size: 10 })),
        user: Get(Var('userRef')),
        bookmarks: q.Map(
          Paginate(Match(Index('bookmarks_by_author'), Var('userRef'))),
          Lambda('nextRef', Get(Var('nextRef')))
        ),
      },
      {
        user: Var('user'),
        bookmarks: Var('bookmarks'),
      }
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

async function searchHashtagsAndUsers(req, res) {
  const { term } = req.query

  const data = await serverClient.query(
    // for the sake of explanation, let's go step by step.
    Let(
      {
        // Matching an index returns a setRef.
        setRef: Match(
          Index('hashtags_and_users_by_wordparts'),
          term.toLowerCase()
        ),
        // We materialize this setRef (get the actual index values)
        // to be able to map over it. We only consider the first
        // page which we'll set to 10 elements, this should be
        // enough for an autocomplete.
        pages: Paginate(Var('setRef'), { size: 10 }),
        // We have defined two values in the index so it returns two
        // values for each match, the length and the reference.
        // Example: [[10, <user or tag ref>], [8,<user or tag ref>], ...]
        // Let's fetch the references
        references: q.Map(Var('pages'), Lambda(['user', 'ref'], Var('ref'))),
      },
      // Finally we can get get data that is associated with these
      // references via Get!
      q.Map(Var('references'), Lambda(['ref'], Get(Var('ref'))))
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}
