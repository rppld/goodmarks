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
import autocompleteSearch from 'lib/autocomplete-search'

function PlaceholderImage() {
  return (
    <span className={styles.placeholder}>
      <Star />
    </span>
  )
}

function MovieSearch(props) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch(props.searchContext)
  const results = useAutocompleteSearch(searchTerm)
  const titleKey = props.searchContext === 'movie' ? 'title' : 'name'

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  return (
    <Combobox
      aria-label={props.label}
      onSelect={(val) => {
        const selectedIndex = findIndex(results, (res) => res[titleKey] === val)
        props.onSelect(results[selectedIndex])
      }}
    >
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder={props.placeholder}
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
      {results && (
        <ComboboxPopover>
          {results.length > 0 ? (
            <ComboboxList>
              {results.map((result) => (
                <ComboboxOption key={result.id} value={result[titleKey]}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={styles.media}>
                      {result.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w220_and_h330_face/${result['poster_path']}`}
                          alt={`Poster for ${result[titleKey]}`}
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

export default MovieSearch
