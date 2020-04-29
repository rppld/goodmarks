import React from 'react'
import cookie from 'cookie'
import Router from 'next/router'
import { FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import createTip from '../../lib/fauna/queries/create-tip'
import { withAuthSync } from '../../lib/auth'
import Layout from '../../components/layout'
import Input from '../../components/input'
import Button from '../../components/button'
import MovieSearch from '../../components/movie-search'
import { getViewer } from '../api/me'
import { useFormik } from 'formik'
import { Listbox, ListboxOption } from '@reach/listbox'

const New = ({ viewer }) => {
  const [category, setCategory] = React.useState('link')
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
      const data = await createTip(viewer.faunaSecret, values)
      Router.push(`/t/${data.id}`)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <div className="new">
        <Listbox value={category} onChange={setCategory}>
          <ListboxOption value="link">Link</ListboxOption>
          <ListboxOption value="movie">Movie</ListboxOption>
        </Listbox>

        {category === 'movie' && <MovieSearch />}

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

          {error && <p className="error">Error: {error}</p>}
        </form>
      </div>

      <style jsx>{`
        .new {
          max-width: 340px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        form {
          display: flex;
          flex-flow: column;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  if (typeof window === 'undefined') {
    const { req, res } = ctx
    const cookies = cookie.parse(req.headers.cookie ?? '')
    const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

    if (!faunaSecret) {
      res.writeHead(302, { Location: '/login' })
      res.end()
      return {}
    }

    const { viewer } = await getViewer(faunaSecret)
    return { viewer }
  }

  const response = await fetch('/api/me')

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const { viewer } = await response.json()

  if (viewer === null) {
    Router.push('/login')
  }

  return { viewer }
}

export default withAuthSync(New)
