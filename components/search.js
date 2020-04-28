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
  const users = useSearch(searchTerm)
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

  return (
    <Combobox aria-label="Cities">
      <ComboboxInput
        className={styles.container}
        onChange={handleSearchTermChange}
      />
      {users && (
        <ComboboxPopover className="shadow-popup">
          {users.length > 0 ? (
            <ComboboxList>
              {users.map((user) => (
                <ComboboxOption key={user.ref['@ref'].id} value={user.name} />
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
      fetchUsers(searchTerm).then((results) => {
        if (isFresh) setResults(results)
      })
      return () => (isFresh = false)
    }
  }, [searchTerm])

  return results
}

const cache = {}
async function fetchUsers(value) {
  if (cache[value]) {
    return Promise.resolve(cache[value])
  }

  return fetch(`/api/search?term=${value}`)
    .then((res) => res.json())
    .then((data) => {
      cache[value] = data
      return data
    })
}

export default Search
