import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import { useFormik } from 'formik'
import { HStack, VStack } from 'components/stack'
import useRequestPasswordReset from 'utils/use-request-password-reset'

const ForgotPassword: NextPage = () => {
  const [submitted, setSubmitted] = React.useState<string>(null)
  const [requestPasswordReset] = useRequestPasswordReset()

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: handleSubmit,
    validateOnChange: false,
  })

  async function handleSubmit() {
    await requestPasswordReset(formik.values.email)
    setSubmitted(formik.values.email)
    formik.resetForm()
  }

  return (
    <Layout title="Forgot password">
      <PageTitle>
        <H4 as="h1">Forgot your password?</H4>
        <Text meta>Enter your email and we will help you reset it.</Text>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
        <Input
          type="email"
          name="email"
          labelText="Email"
          hideLabel
          placeholder="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <footer>
          <VStack spacing="md">
            {submitted && (
              <Text>
                We've sent an email to {submitted}. Click the link inside the
                email to set a new password.
              </Text>
            )}

            <HStack alignment="trailing">
              <Button
                type="submit"
                variant="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Loading' : 'Reset password'}
              </Button>
            </HStack>
          </VStack>
        </footer>
      </Form>
    </Layout>
  )
}

export default ForgotPassword
