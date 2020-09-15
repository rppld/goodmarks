import React from 'react'

const useResetPassword = (): [
  (email: string) => Promise<void>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(email) {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

export default useResetPassword
