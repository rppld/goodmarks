import React from 'react'
import Router from 'next/router'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import Input from 'components/input'
import Form from 'components/form'
import { H2 } from 'components/heading'
import Text from 'components/text'
import PageTitle from 'components/page-title'
import { HStack } from 'components/stack'
import Button from 'components/button'
import debounce from 'lodash/debounce'
import { mutate } from 'swr'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const Signup: NextPage = () => {
  const [hasValidUsername, setHasValidUsername] = React.useState(undefined)
  const [error, setError] = React.useState(null)

  const checkUsername = async (value) => {
    if (!value) return true
    try {
      const res = await fetch(`/api/users?handle=${value}`)
      const exists = Boolean(await res.json())
      setHasValidUsername(exists)
      return exists ? false : true
    } catch {
      return false
    }
  }

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(5, 'Must be 5 characters or more')
      .max(15, 'Must be 15 characters or less')
      .test('unique-username', 'This username is already taken', checkUsername)
      .required('Required'),
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: handleSubmit,
    validationSchema,
    validateOnChange: false,
  })

  const debouncedValidateForm = debounce(formik.validateForm, 1000)

  const handleChange = (e) => {
    formik.handleChange(e)
    debouncedValidateForm()
  }

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
      Router.push('/')
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
          value={formik.values.username}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.values.username.length > 0 &&
            typeof hasValidUsername !== 'undefined'
              ? formik.errors.username
                ? String(formik.errors.username)
                : 'This username is available'
              : undefined
          }
          validate={
            formik.values.username.length > 0 &&
            typeof hasValidUsername !== 'undefined'
              ? () => {
                  return formik.errors.username ? false : true
                }
              : undefined
          }
        />

        <Input
          name="email"
          type="email"
          labelText="Email"
          value={formik.values.email}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.errors.email && formik.touched.email
              ? String(formik.errors.email)
              : null
          }
        />

        <Input
          type="password"
          name="password"
          labelText="Password"
          value={formik.values.password}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.errors.password && formik.touched.password
              ? String(formik.errors.password)
              : null
          }
        />

        <HStack alignment="space-between">
          <Button as="a" href="/api/auth?action=oauth2&provider=google">
            Continue with Google
          </Button>
          <Button type="submit">Sign up</Button>
        </HStack>

        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default Signup
