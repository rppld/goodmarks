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
import * as Yup from 'yup'

const Login: NextPage = () => {
  const { query } = useRouter()
  const [changePassword] = useChangePassword()
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Must be 8 characters or more')
      .required('Required'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords don’t match')
      .required('Required'),
  })
  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirm: '',
    },
    onSubmit: handleSubmit,
    validationSchema,
    validateOnChange: false,
  })

  async function handleSubmit() {
    if (formik.isValid) {
      await changePassword(formik.values.password, query.token as string)
      return formik.resetForm()
    }
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
          onBlur={formik.handleBlur}
          help={
            formik.errors.password && formik.touched.password
              ? String(formik.errors.password)
              : undefined
          }
          validate={formik.errors.password ? () => false : undefined}
        />
        <Input
          type="password"
          name="passwordConfirm"
          labelText="Confirm password"
          hideLabel
          placeholder="Confirm password"
          value={formik.values.passwordConfirm}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          help={
            formik.errors.passwordConfirm && formik.touched.passwordConfirm
              ? String(formik.errors.passwordConfirm)
              : undefined
          }
          validate={formik.errors.passwordConfirm ? () => false : undefined}
        />
        <Button type="submit" variant="primary" size="lg">
          Set new password
        </Button>
      </Form>
    </Layout>
  )
}

export default Login
