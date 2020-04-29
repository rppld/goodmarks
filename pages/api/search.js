import { query as q } from 'faunadb'
import { serverClient } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import fetch from 'isomorphic-unfetch'

function transform(data) {
  return data.results
}

async function searchMovies(query, page = 1) {
  return fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}&page=${page}&include_adult=false`
  )
    .then((res) => res.json())
    .then(transform)
    .catch((err) => {
      console.log(err)
      throw err
    })
}

async function searchHashtagsAndUsers(keyword) {
  const { Match, Paginate, Index, Lambda, Let, Var, Get } = q
  return serverClient
    .query(
      // for the sake of explanation, let's go step by step.
      Let(
        {
          // Matching an index returns a setRef.
          setRef: Match(
            Index('hashtags_and_users_by_wordparts'),
            keyword.toLowerCase()
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
    .then(flattenDataKeys)
    .catch((err) => {
      console.log(err)
      throw err
    })
}

export default async (req, res) => {
  const { term, context } = req.query

  if (context === 'movies') {
    return res.status(200).json(await searchMovies(term))
  }

  return res.status(200).json(await searchHashtagsAndUsers(term))
}