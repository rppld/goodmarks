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
      email: '',
      password: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit({ email, password }) {
    setError(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      mutate('/api/profile')
      Router.push('/profile')
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <div className="signup">
        <Button as="a" href="/api/auth/google">
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

          <Button type="submit">Sign up</Button>

          {error && <p className="error">Error: {error}</p>}
        </form>

        <p>
          Already have an account?{' '}
          <Link href="/login">
            <a>Login</a>
          </Link>
        </p>
      </div>
      <style jsx>{`
        .signup {
          max-width: 340px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        form {
          display: flex;
          flex-flow: column;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

export default Signup
