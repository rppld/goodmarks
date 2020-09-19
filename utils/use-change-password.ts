import React from 'react'

const useChangePassword = (): [
  (password: string, token: string) => Promise<void>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(password, token) {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth?action=change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      })

      if (response.ok) {
        setLoading(false)
      }
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useChangePassword
