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
import autocompleteSearch from '../lib/autocomplete-search'

function SiteSearch() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch('hashtags_and_users')
  const users = useAutocompleteSearch(searchTerm)

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
        placeholder="#covid19"
        as={ComboboxInput}
      />
      {users && (
        <ComboboxPopover>
          {users.length > 0 ? (
            <ComboboxList>
              {users.map((user) => (
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
