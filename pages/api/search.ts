import { query as q } from 'faunadb'
import { serverClient, flattenDataKeys } from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import qs from 'querystringify'

const { Map, Match, Paginate, Index, Lambda, Let, Var, Get } = q

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { context } = req.query

  if (context === 'movie' || context === 'tv') {
    return searchTMDb(req, res, context)
  }

  if (context === 'hashtags_and_users') {
    return searchTagsAndUsers(req, res)
  }

  return res.status(400).send('No context defined')
}

async function searchTMDb(
  req: NextApiRequest,
  res: NextApiResponse,
  context: string
) {
  const { term } = req.query
  const params = qs.stringify({
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

async function searchTagsAndUsers(req, res) {
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
        references: Map(Var('pages'), Lambda(['user', 'ref'], Var('ref'))),
      },
      // Finally we can get get data that is associated with these
      // references via Get!
      Map(Var('references'), Lambda(['ref'], Get(Var('ref'))))
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

export default handler
