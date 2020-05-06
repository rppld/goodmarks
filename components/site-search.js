import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import Router from 'next/router'
import debounce from 'lodash/debounce'
import Input from './input'
import findIndex from 'lodash/findIndex'
import autocompleteSearch from '../lib/autocomplete-search'

function SiteSearch() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch('tags_and_users')
  const results = useAutocompleteSearch(searchTerm)

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  function handleSelect(result = {}) {
    if (typeof result.handle !== 'undefined') {
      return Router.push('/[user]', `/${result.handle}`)
    }

    return Router.push('/tags/[tag]', `/tags/${result.name}`)
  }

  React.useEffect(() => {
    return function cleanup() {
      // Cancel any leftover calls before unmounting
      handleChange.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Combobox
      aria-label="Cities"
      onSelect={(val) => {
        const selectedIndex = findIndex(results, (res) => res.name === val)
        handleSelect(results[selectedIndex])
      }}
    >
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="#covid19"
        as={ComboboxInput}
      />
      {results && (
        <ComboboxPopover>
          {results.length > 0 ? (
            <ComboboxList>
              {results.map((user) => (
                <ComboboxOption key={user.id} value={user.name} />
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

export default SiteSearch
