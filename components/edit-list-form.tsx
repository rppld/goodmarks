import React from 'react'
import Router from 'next/router'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/router'
import parseHashtags from 'utils/parse-hashtags'
import Input from './input'
import { useFormik } from 'formik'
import Button from './button'
import Form from './form'
import Checkbox from './checkbox'
import { useViewer } from './viewer-context'

const EditListForm: React.FC = () => {
  const { query } = useRouter()
  const { viewer } = useViewer()
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      private: false,
    },
    onSubmit: handleSubmit,
  })

  useSWR(query?.id ? `/api/lists?id=${query.id}` : null, {
    onSuccess: (data) => {
      const list = data.edges[0].list
      formik.setFieldValue('name', list.name)
      formik.setFieldValue('description', list.description)
      formik.setFieldValue('private', list.private)
    },
  })

  async function update(values) {
    const res = await fetch('/api/lists?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listId: query.id,
        name: values.name,
        description: values.description,
        private: values.private,
        hashtags: parseHashtags(values.description),
      }),
    })
    mutate(`/api/lists?id=${query.id}`)
    return res
  }

  async function create(values) {
    return await fetch('/api/lists?action=create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        private: values.private,
        hashtags: parseHashtags(values.description),
        items: [],
      }),
    })
  }

  async function handleSubmit(values) {
    setError(null)

    try {
      // If there’s a list ID in the URL, we can assume the user is on
      // the route to update a list.
      const response = query?.id ? await update(values) : await create(values)

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
        help="The name for your list"
        defaultValue={formik.values.name}
        onChange={formik.handleChange}
      />

      <Input
        as="textarea"
        rows="6"
        name="description"
        labelText="Description"
        help="Describe what your list is about"
        defaultValue={formik.values.description}
        onChange={formik.handleChange}
      />

      <Checkbox
        name="private"
        labelText="Private"
        help="Choose whether the list should be public or private"
        onChange={formik.handleChange}
        checked={formik.values.private}
      />

      <Button type="submit" variant="primary" size="lg">
        {query?.id ? 'Save Changes' : 'Create List'}
      </Button>

      {error && <p>Error: {error}</p>}
    </Form>
  )
}

export default EditListForm
