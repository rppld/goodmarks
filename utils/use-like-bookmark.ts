import React from 'react'

const useLikeBookmark = (): [
  (id: string) => void,
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

      await fetch('/api/bookmarks?action=like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookmarkId: id,
        }),
      })

      setLoading(false)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useLikeBookmark
