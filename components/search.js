import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import styles from './input.module.css'
import algolia from '../lib/algolia'

function Search(props) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const users = useAlgolia(searchTerm)
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
                <ComboboxOption key={user.objectID} value={user.username} />
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

function useAlgolia(searchTerm) {
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
function fetchUsers(value) {
  if (cache[value]) {
    return Promise.resolve(cache[value])
  }

  return algolia.search(value).then(({ hits }) => {
    cache[value] = hits
    return hits
  })
}

export default Search
