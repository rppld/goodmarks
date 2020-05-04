import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import Image from './image'
import Input from './input'
import { Star } from './icon'
import debounce from 'lodash/debounce'
import styles from './movie-search.module.css'
import findIndex from 'lodash/findIndex'

function PlaceholderImage() {
  return (
    <span className={styles.placeholder}>
      <Star />
    </span>
  )
}

function MovieSearch(props) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const movies = useSearch(searchTerm)

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  return (
    <Combobox
      aria-label="Movies"
      onSelect={(val) => {
        const selectedIndex = findIndex(movies, (movie) => movie.title === val)
        props.onSelect(movies[selectedIndex])
      }}
    >
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search movies"
        as={ComboboxInput}
        help={
          <span
            dangerouslySetInnerHTML={{
              __html:
                "Powered by <a href='https://www.themoviedb.org'>The Movie Database (TMDb)</a>",
            }}
          />
        }
      />
      {movies && (
        <ComboboxPopover className="shadow-popup">
          {movies.length > 0 ? (
            <ComboboxList>
              {movies.map((movie, index) => (
                <ComboboxOption
                  key={movie.id}
                  value={movie.title}
                  data-index={index}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={styles.media}>
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w220_and_h330_face/${movie['poster_path']}`}
                          alt={`Poster for ${movie.title}`}
                          className={styles.image}
                        />
                      ) : (
                        <PlaceholderImage />
                      )}
                    </div>
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
