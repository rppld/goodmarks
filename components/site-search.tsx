import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import Router from 'next/router'
import debounce from 'lodash/debounce'
import Input from './input'
import autocompleteSearch from 'utils/autocomplete-search'

const SiteSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const useAutocompleteSearch = autocompleteSearch('hashtags_and_users')
  const results = useAutocompleteSearch(searchTerm)
  const min = 3

  const handleChange = debounce((value) => {
    value.length >= min && setSearchTerm(value)
  }, 250)

  function handleSelect(result: any = {}) {
    const isUser = typeof result.handle !== 'undefined'
    const isHashtag = !isUser

    if (isUser) {
      return Router.push('/[user]', `/${result.handle}`)
    }

    if (isHashtag) {
      // For proper routing we need to remove the leading hash.
      const tag = result.name
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
        const matchUserOrHashtag = (item) => {
          return item.handle ? item.handle === val : item.name === val
        }
        const selectedItem = results.filter(matchUserOrHashtag)[0]
        handleSelect(selectedItem)
      }}
    >
      <Input
        name="search"
        labelText="Search"
        hideLabel
        onChange={(e) => handleChange(e.target.value)}
        placeholder="#covid19"
        as={ComboboxInput}
      />

      {results && (
        <ComboboxPopover>
          {results.length > 0 ? (
            <ComboboxList>
              {results.map((item) => (
                <ComboboxOption key={item.id} value={item.handle || item.name}>
                  {item.name && <span>#</span>}
                  <ComboboxOptionText />
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

export default SiteSearch
