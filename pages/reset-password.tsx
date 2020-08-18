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
    <Layout>
      {!submitted && (
        <>
          <PageTitle>
            <H4 as="h1">Reset your password</H4>
            <Text meta>Enter a new password for email@example.com</Text>
          </PageTitle>
          <Form>
            <Input
              type="password"
              name="password"
              labelText="New password"
              hideLabel
              placeholder="New password"
            />
            <Input
              type="password"
              name="confirm-password"
              labelText="Confirm password"
              hideLabel
              placeholder="Confirm password"
            />
            <Button type="submit" variant="primary" size="lg">
              Set new password
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
          <Link href="/reset-password">Go back</Link>
        </PageTitle>
      )}
    </Layout>
  )
}

export default Login
