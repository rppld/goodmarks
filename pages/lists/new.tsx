import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import { useFormik } from 'formik'

const NewList: NextPage = () => {
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit(values) {
    setError(null)
    console.log(values)
  }

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">New List</H4>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
        <Input
          type="text"
          name="title"
          labelText="Title"
          help="Keep it short"
          onChange={formik.handleChange}
        />

        <Input
          as="textarea"
          rows="6"
          name="description"
          labelText="Description"
          help="Describe what your list is about"
          onChange={formik.handleChange}
        />

        <Button type="submit" variant="primary" size="lg">
          Create List
        </Button>

        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default NewList
