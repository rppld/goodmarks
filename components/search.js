import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import styles from './input.module.css'

function Search(props) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const cities = useCitySearch(searchTerm)
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

  return (
    <Combobox aria-label="Cities">
      <ComboboxInput
        className={styles.container}
        onChange={handleSearchTermChange}
      />
      {cities && (
        <ComboboxPopover className="shadow-popup">
          {cities.length > 0 ? (
            <ComboboxList>
              {cities.map((city) => {
                const str = `${city.city}, ${city.state}`
                return <ComboboxOption key={str} value={str} />
              })}
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

function useCitySearch(searchTerm) {
  const [cities, setCities] = React.useState([])

  React.useEffect(() => {
    if (searchTerm.trim() !== '') {
      let isFresh = true
      fetchCities(searchTerm).then((cities) => {
        if (isFresh) setCities(cities)
      })
      return () => (isFresh = false)
    }
  }, [searchTerm])

  return cities
}

const cache = {}
function fetchCities(value) {
  if (cache[value]) {
    return Promise.resolve(cache[value])
  }

  return fetch('https://city-search.now.sh/?' + value)
    .then((res) => res.json())
    .then((result) => {
      cache[value] = result
      return result
    })
}

export default Search
