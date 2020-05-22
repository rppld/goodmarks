import React from 'react'
import { Comment } from 'lib/types'

const useDeleteComment = (): [
  (id: string) => Promise<{ comment: Comment }>,
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

      const res = await fetch('/api/bookmarks?action=delete-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: id,
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

export default useDeleteComment
