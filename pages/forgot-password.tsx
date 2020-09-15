import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import Link from 'next/link'

const Login: NextPage = () => {
  const [submitted, setSubmitted] = React.useState(false)

  return (
    <Layout title="Forgot password">
      {!submitted && (
        <>
          <PageTitle>
            <H4 as="h1">Forgot your password?</H4>
            <Text meta>
              Enter your email and we will help you reset your password.
            </Text>
          </PageTitle>
          <Form>
            <Input
              type="email"
              name="email"
              labelText="Email"
              hideLabel
              placeholder="Email"
            />
            <Button type="submit" variant="primary" size="lg">
              Reset password
            </Button>
            {/* {error && <p>Error: {error}</p>} */}
          </Form>{' '}
        </>
      )}

      {submitted && (
        <PageTitle>
          <H4 as="h1">We've sent an email to email@example.com</H4>
          <Text meta>
            Click the link inside the email to set a new password.
          </Text>
          <Link href="/forgot-password">Go back</Link>
        </PageTitle>
      )}
    </Layout>
  )
}

export default Login
