import React from 'react'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'
import { useFormik } from 'formik'
import Router from 'next/router'
import Input from './input'
import Button from './button'
import Form from './form'
import Link from 'next/link'
import Layout from './layout'
import Header from './header'
import { MenuBar, MenuBarNav, MenuBarNavItem } from './menu-bar'
import { ChevronLeft } from './icon'

const NewLinkForm = () => {
  const [error, setError] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      url: '',
      tags: '',
    },
    onSubmit: handleSubmit,
  })

  async function handleSubmit({ tags, ...values }) {
    setError(null)

    try {
      const response = await fetch('/api/bookmarks?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          tags: tags.replace(/\s+/g, '').split(','),
          category: 'links',
        }),
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
    <Layout
      header={
        <Header>
          <MenuBar>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/new" passHref>
                  <Button as="a" leftAdornment={<ChevronLeft />}>
                    New bookmark
                  </Button>
                </Link>
              </MenuBarNavItem>
            </MenuBarNav>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/" passHref>
                  <Button as="a" variant="danger">
                    Cancel
                  </Button>
                </Link>
              </MenuBarNavItem>
            </MenuBarNav>
          </MenuBar>
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">Link</H2>
        <Text meta>Provide the link details.</Text>
      </PageTitle>

      <Form onSubmit={formik.handleSubmit}>
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

        <Input
          name="tags"
          labelText="Tags"
          placeholder="#covid19"
          value={formik.values.tags}
          onChange={formik.handleChange}
        />

        <MenuBar>
          <Button type="submit" variant="primary">
            Add bookmark
          </Button>
        </MenuBar>

        {error && <p>Error: {error}</p>}
      </Form>
    </Layout>
  )
}

export default NewLinkForm
