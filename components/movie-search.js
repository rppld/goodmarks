import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import debounce from 'lodash/debounce'
import styles from './input.module.css'

function MovieSearch() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const movies = useSearch(searchTerm)

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  return (
    <Combobox aria-label="Movies">
      <ComboboxInput
        className={styles.base}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search movies"
      />
      {movies && (
        <ComboboxPopover className="shadow-popup">
          {movies.length > 0 ? (
            <ComboboxList>
              {movies.map((movie) => (
                <ComboboxOption key={movie.id} value={movie.title}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w220_and_h330_face/${movie.poster_path}`}
                        alt={`Poster for ${movie.title}`}
                        style={{
                          width: 24,
                          height: 36,
                          borderRadius: 4,
                          marginRight: 4,
                        }}
                      />
                    ) : null}
                    <ComboboxOptionText />
                  </div>
                </ComboboxOption>
              ))}
            </ComboboxList>
          ) : (
            <span style={{ display: 'block', margin: 8 }}>
              No results found
            </span>
          )}
        </ComboboxPopover>
      )}
    </Combobox>
  )
}

function useSearch(searchTerm) {
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

const cache = {}
async function fetchResults(value) {
  if (cache[value]) {
    return Promise.resolve(cache[value])
  }

  return fetch(`/api/search?context=movies&term=${value}`)
    .then((res) => res.json())
    .then((data) => {
      cache[value] = data
      return data
    })
}

export default MovieSearch
