import React from 'react'
import cookie from 'cookie'
import Router from 'next/router'
import Link from 'next/link'
import { withAuthSync } from '../lib/auth'
import { FAUNA_SECRET_COOKIE } from '../lib/fauna'
import { getViewer } from './api/me'
import Layout from '../components/layout'
import useSWR from 'swr'

const Profile = (props) => {
  const { viewer } = props
  const { data, error } = useSWR(`/api/tips?user_id=${viewer.id}`)

  return (
    <Layout>
      <h1>Your profile</h1>
      <p>Your user id is: {viewer.id}</p>

      <h2>Your tips</h2>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <ol>
          {data.tips.map((tip) => (
            <li key={tip.id}>
              <Link href="t/[id]" as={`/t/${tip.id}`}>
                <a>{tip.title}</a>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Layout>
  )
}

Profile.getInitialProps = async (ctx) => {
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

export default withAuthSync(Profile)
