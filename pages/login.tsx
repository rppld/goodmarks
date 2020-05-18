import React from 'react'
import { NextPage } from 'next'
import Router from 'next/router'
import Link from 'next/link'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { H2 } from 'components/heading'
import Text from 'components/text'
import PageTitle from 'components/page-title'
import GoogleG from 'components/google-g'
import { mutate } from 'swr'
import { useFormik } from 'formik'

const Login: NextPage = () => {
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
      Router.push('/')
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Log in</H2>
        <Text meta>
          Or{' '}
          <Link href="/signup">
            <a>create an account</a>
          </Link>{' '}
          if you don’t have one yet.
        </Text>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
        <Button
          as="a"
          href="/api/auth?action=oauth2&provider=google"
          size="lg"
          leftAdornment={<GoogleG />}
        >
          Continue with Google
        </Button>
        <span>or log in using your email address</span>
        <Input
          type="email"
          name="email"
          labelText="Email"
          hideLabel
          placeholder="Email"
          onChange={formik.handleChange}
        />
        <Input
          type="password"
          name="password"
          labelText="Password"
          hideLabel
          placeholder="Password"
          onChange={formik.handleChange}
        />
        <Button type="submit" variant="primary" size="lg">
          Log in
        </Button>
        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default Login
