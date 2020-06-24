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
import autocompleteSearch from 'utils/autocomplete-search'

const PlaceholderImage: React.FC = () => {
  return (
    <span className={styles.placeholder}>
      <Star />
    </span>
  )
}

interface Props {
  context: string
  label: string
  onSelect: (args: any) => void
  placeholder: string
}

const MovieSearch: React.FC<Props> = ({
  context,
  label,
  onSelect,
  placeholder,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch(context)
  const results = useAutocompleteSearch(searchTerm)
  const titleKey = context === 'movie' ? 'title' : 'name'

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  return (
    <Combobox
      aria-label={label}
      onSelect={(val) => {
        const selectedIndex = findIndex(results, (res) => res[titleKey] === val)
        onSelect(results[selectedIndex])
      }}
    >
      <Input
        name="Search TMDb"
        labelText="Search"
        hideLabel
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
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
