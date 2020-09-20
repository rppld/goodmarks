import React from 'react'
import { NextPage } from 'next'
import Router from 'next/router'
import Link from 'next/link'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { H4 } from 'components/heading'
import { Text, SmallText } from 'components/text'
import PageTitle from 'components/page-title'
import GoogleG from 'components/google-g'
import { mutate } from 'swr'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const Login: NextPage = () => {
  const [error, setError] = React.useState(null)
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
  })
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: handleSubmit,
    validateOnChange: false,
    validationSchema,
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
    <Layout title="Log in">
      <PageTitle>
        <H4 as="h1">Log In</H4>
        <Text meta>
          Or{' '}
          <Link href="/signup">
            <a>create an account</a>
          </Link>{' '}
          if you don’t have one yet.
        </Text>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
        {process.env.NODE_ENV === 'development' && (
          <>
            <Button
              as="a"
              href="/api/auth?action=oauth2&provider=google"
              size="lg"
              leftAdornment={<GoogleG />}
            >
              Continue with Google
            </Button>
            <span>or log in using your email address</span>
          </>
        )}

        <Input
          type="email"
          name="email"
          labelText="Email"
          hideLabel
          placeholder="Email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <Input
          type="password"
          name="password"
          labelText="Password"
          hideLabel
          placeholder="Password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" size="lg">
          Log in
        </Button>

        {error && <p>Error: {error}</p>}

        <SmallText>
          <Link href="/forgot-password">Forgot your password?</Link>
        </SmallText>
      </Form>
    </Layout>
  )
}

export default Login
