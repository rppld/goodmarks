import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import Layout from '../components/layout'
import Input from '../components/input'
import Button from '../components/button'
import { mutate } from 'swr'
import { useFormik } from 'formik'

function Login() {
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit({ email, password }) {
    setError(null)

    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      mutate('/api/me')
      Router.push('/profile')
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <Button as="a" href="/api/auth?action=oauth2&provider=google">
        Continue with Google
      </Button>

      <form onSubmit={formik.handleSubmit}>
        <Input
          name="email"
          labelText="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
        />

        <Input
          type="password"
          name="password"
          labelText="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />

        <Button type="submit">Login</Button>

        {error && <p>Error: {error}</p>}
      </form>

      <p>
        No account yet?{' '}
        <Link href="/signup">
          <a>Signup</a>
        </Link>
      </p>
    </Layout>
  )
}

export default Login
