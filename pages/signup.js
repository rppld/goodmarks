import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import Layout from '../components/layout'
import Input from '../components/input'
import Form from '../components/form'
import { H2 } from '../components/heading'
import Text from '../components/text'
import PageTitle from '../components/page-title'
import { MenuBar } from '../components/menu-bar'
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
        body: JSON.stringify({ name: username, email, password }),
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
      <PageTitle>
        <H2 as="h1">Signup</H2>
        <Text meta>
          Or{' '}
          <Link href="/login">
            <a>login</a>
          </Link>{' '}
          if you already have an account.
        </Text>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
        <Input
          name="username"
          labelText="Username"
          onChange={formik.handleChange}
        />

        <Input name="email" labelText="Email" onChange={formik.handleChange} />

        <Input
          type="password"
          name="password"
          labelText="Password"
          onChange={formik.handleChange}
        />

        <MenuBar>
          <Button as="a" href="/api/auth?action=oauth2&provider=google">
            Continue with Google
          </Button>
          <Button type="submit">Sign up</Button>
        </MenuBar>

        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default Signup
