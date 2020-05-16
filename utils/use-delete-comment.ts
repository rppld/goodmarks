import React from 'react'

interface Options {
  onSuccess: (response) => void
}

const useDeleteComment = (
  options: Options
): [
  (id: string) => Promise<void>,
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

      if (typeof options.onSuccess !== 'undefined') {
        options.onSuccess(await res.json())
      }

      setLoading(false)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useDeleteComment
