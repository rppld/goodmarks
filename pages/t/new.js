import React from 'react'
import cookie from 'cookie'
import Router from 'next/router'
import { FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import { withAuthSync } from '../../lib/auth'
import Layout from '../../components/layout'
import Input from '../../components/input'
import Button from '../../components/button'
import { getViewerId } from '../api/profile'

const createNewTip = async (title, link, userId) => {
  const response = await fetch('/api/tips/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, link, userId }),
  })

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const json = await response.json()
  Router.push(`/t/${json.id}`)
}

const New = (props) => {
  const [payload, setPayload] = React.useState({
    title: '',
    link: '',
    error: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setPayload({ ...payload, error: '' })
    const title = payload.title
    const link = payload.link

    try {
      await createNewTip(title, link, props.userId)
    } catch (error) {
      console.error(error)
      setPayload({ ...payload, error: error.message })
    }
  }

  return (
    <Layout>
      <div className="new">
        <form onSubmit={handleSubmit}>
          <Input
            name="title"
            labelText="Title"
            value={payload.title}
            onChange={(event) =>
              setPayload(
                Object.assign({}, payload, { title: event.target.value })
              )
            }
          />

          <Input
            as="textarea"
            rows="6"
            name="link"
            labelText="Link"
            value={payload.link}
            onChange={(event) =>
              setPayload(
                Object.assign({}, payload, { link: event.target.value })
              )
            }
          />

          <Button type="submit">Add</Button>

          {payload.error && <p className="error">Error: {payload.error}</p>}
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

    const userId = await getViewerId(faunaSecret)
    return { userId }
  }

  const response = await fetch('/api/profile')

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const data = await response.json()

  if (data.userId === null) {
    Router.push('/login')
    return {}
  }

  return { userId: data.userId }
}

export default withAuthSync(New)
