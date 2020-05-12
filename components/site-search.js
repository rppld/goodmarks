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
import autocompleteSearch from 'lib/autocomplete-search'

function SiteSearch() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch('hashtags_and_users')
  const results = useAutocompleteSearch(searchTerm)

  const handleChange = debounce((value) => {
    setSearchTerm(value)
  }, 250)

  function handleSelect(result = {}) {
    const isUser = typeof result.handle !== 'undefined'
    const isHashtag = !isUser

    if (isUser) {
      return Router.push('/[user]', `/${result.handle}`)
    }

    if (isHashtag) {
      // For proper routing we need to remove the leading hash.
      const tag = result.name.substr(1)
      return Router.push('/hashtags/[hashtag]', `/hashtags/${tag}`)
    }

    return false
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
