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
import { useRouter } from 'next/router'
import useChangePassword from 'utils/use-change-password'
import { toast } from 'react-toastify'

const Login: NextPage = () => {
  const { query } = useRouter()
  const [changePassword] = useChangePassword()

  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirm: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit() {
    if (
      formik.values.password.length > 0 &&
      formik.values.password === formik.values.passwordConfirm
    ) {
      await changePassword(formik.values.password, query.token as string)
      return formik.resetForm()
    }

    console.log('Passwords don’t match.')
  }

  return (
    <Layout title="Reset password">
      <PageTitle>
        <H4 as="h1">Reset your password</H4>
        <Text meta>Enter a new password for email@example.com</Text>
      </PageTitle>
      <Form onSubmit={formik.handleSubmit}>
        <Input
          type="password"
          name="password"
          labelText="New password"
          hideLabel
          placeholder="New password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
        <Input
          type="password"
          name="passwordConfirm"
          labelText="Confirm password"
          hideLabel
          placeholder="Confirm password"
          value={formik.values.passwordConfirm}
          onChange={formik.handleChange}
        />
        <Button type="submit" variant="primary" size="lg">
          Set new password
        </Button>
      </Form>
    </Layout>
  )
}

export default Login
