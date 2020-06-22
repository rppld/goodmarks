import React from 'react'
import { BookmarksData } from 'lib/types'

const useRemoveBookmarkFromList = (): [
  (itemId: string, listId: string) => Promise<BookmarksData>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(itemId, listId) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/lists?action=remove-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          listId,
        }),
      })

      const json = await res.json()
      setLoading(false)
      return json
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useRemoveBookmarkFromList
