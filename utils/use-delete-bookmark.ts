import React from 'react'
import Router from 'next/router'

type Hook = () => [
  (id: string) => Promise<void>,
  {
    loading: boolean
    error: string | null
  }
]

const useDeleteBookmark: Hook = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(id) {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/bookmarks?action=delete&id=${id}`, {
        method: 'POST',
      })

      if (response.ok) {
        Router.push('/')
      }
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useDeleteBookmark
