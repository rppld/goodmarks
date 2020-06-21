import React from 'react'
import Router from 'next/router'
import parseHashtags from 'utils/parse-hashtags'
import Input from './input'
import { useFormik } from 'formik'
import Button from './button'
import Form from './form'
import { useViewer } from './viewer-context'

const NewListForm: React.FC = () => {
  const { viewer, setViewer } = useViewer()
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit(values) {
    setError(null)

    try {
      const response = await fetch('/api/lists?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          hashtags: parseHashtags(values.description),
          items: [],
        }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      const href = '/[user]/lists/[id]'
      const as = `/${viewer.handle}/lists/${data.id}`
      Router.push(href, as)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Input
        type="text"
        name="name"
        labelText="Name"
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
  )
}

export default NewListForm
