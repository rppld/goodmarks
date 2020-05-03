import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import debounce from 'lodash/debounce'
import Input from './input'

function SiteSearch() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const users = useSearch(searchTerm)
  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  React.useEffect(() => {
    return function cleanup() {
      // Cancel any leftover calls before unmounting
      handleChange.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Combobox aria-label="Cities">
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search hashtags and users"
        as={ComboboxInput}
      />
      {users && (
        <ComboboxPopover>
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

  return fetch(`/api/search?term=${value}`)
    .then((res) => res.json())
    .then((data) => {
      cache[value] = data
      return data
    })
}

export default SiteSearch
