import React from 'react'
import { Comment } from 'lib/types'

const useCreateComment = (): [
  (text: string, bookmarkId: string) => Promise<{ comment: Comment }>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(text, bookmarkId) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/bookmarks?action=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          bookmarkId,
        }),
      })

      setLoading(false)
      return await res.json()
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useCreateComment
