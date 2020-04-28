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

export default async (req, res) => {
  const { term } = req.query
  return res.status(200).json(await searchMovies(term))
}
