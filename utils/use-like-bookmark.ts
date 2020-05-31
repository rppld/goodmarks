import React from 'react'
import { BookmarksData } from 'lib/types'

const useLikeBookmark = (): [
  (id: string) => Promise<BookmarksData>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(id) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/bookmarks?action=like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookmarkId: id,
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

export default useLikeBookmark
