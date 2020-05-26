import React from 'react'
import Router from 'next/router'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import Input from 'components/input'
import Form from 'components/form'
import { H2 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import Button from 'components/button'
import debounce from 'lodash/debounce'
import { mutate } from 'swr'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import GoogleG from 'components/google-g'

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

  const checkWhitespace = (value) => {
    if (/\s/.test(value)) return false
    return true
  }

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(5, 'Must be 5 characters or more')
      .max(15, 'Must be 15 characters or less')
      .test(
        'whitespace',
        'The username can’t contain any spaces',
        checkWhitespace
      )
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
      Router.push('/signup/picture')
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Create an account</H2>
        <Text meta>
          Or{' '}
          <Link href="/login">
            <a>log in</a>
          </Link>{' '}
          if you already have an account.
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

        <span>or sign up using your email address</span>

        <Input
          name="username"
          labelText="Display name"
          hideLabel
          placeholder="Display name"
          value={formik.values.username}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.values.username.length > 0 &&
            typeof hasValidUsername !== 'undefined'
              ? formik.errors.username
                ? String(formik.errors.username)
                : 'This username is available'
              : 'A unique username that will be used throughout the platform'
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
          hideLabel
          placeholder="Email"
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
          hideLabel
          placeholder="Password"
          value={formik.values.password}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.errors.password && formik.touched.password
              ? String(formik.errors.password)
              : null
          }
        />

        <Button type="submit" size="lg" variant="primary">
          Sign up
        </Button>

        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default Signup
