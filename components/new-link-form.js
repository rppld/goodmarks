import React from 'react'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'
import { useFormik } from 'formik'
import Router from 'next/router'
import Input from '../components/input'
import Button from '../components/button'

const NewLinkForm = () => {
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      url: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit(values) {
    setError(null)

    try {
      const response = await fetch('/api/bookmarks?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      Router.push(`/b/${data.id}`)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <>
      <PageTitle>
        <H2 as="h1">Link</H2>
        <Text meta>Provide the link details.</Text>
      </PageTitle>

      <form onSubmit={formik.handleSubmit}>
        <Input
          name="title"
          labelText="Title"
          value={formik.values.title}
          onChange={formik.handleChange}
        />

        <Input
          as="textarea"
          rows="6"
          name="description"
          labelText="Description"
          value={formik.values.description}
          onChange={formik.handleChange}
        />

        <Input
          name="url"
          labelText="URL"
          placeholder="https://"
          value={formik.values.url}
          onChange={formik.handleChange}
        />

        <Button type="submit">Add</Button>

        {error && <p>Error: {error}</p>}
      </form>
    </>
  )
}

export default NewLinkForm
