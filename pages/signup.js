import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import Layout from '../components/layout'
import Input from '../components/input'
import Button from '../components/button'
import { mutate } from 'swr'
import { useFormik } from 'formik'

function Signup() {
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit({ username, email, password }) {
    setError(null)

    try {
      const response = await fetch('/api/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
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
          name="username"
          labelText="Username"
          value={formik.values.username}
          onChange={formik.handleChange}
        />

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

        <Button type="submit">Sign up</Button>

        {error && <p>Error: {error}</p>}
      </form>

      <p>
        Already have an account?{' '}
        <Link href="/login">
          <a>Login</a>
        </Link>
      </p>
    </Layout>
  )
}

export default Signup
