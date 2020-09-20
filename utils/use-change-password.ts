import React from 'react'
import { toast } from 'react-toastify'

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
        toast.success(await response.text())
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
