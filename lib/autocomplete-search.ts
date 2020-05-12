import React from 'react'

export default function autocompleteSearch(context: string) {
  const cache = {}
  async function fetchResults(value) {
    if (cache[value]) {
      return Promise.resolve(cache[value])
    }

    return fetch(`/api/search?context=${context}&term=${value}`)
      .then((res) => res.json())
      .then((data) => {
        cache[value] = data
        return data
      })
  }

  return function useSearch(searchTerm) {
    const [results, setResults] = React.useState([])

    React.useEffect(() => {
      if (searchTerm.trim() !== '') {
        let isFresh = true
        fetchResults(searchTerm).then((results) => {
          if (isFresh) setResults(results)
        })
        return () => (isFresh = false)
      }
    }, [searchTerm])

    return results
  }
}
