import React from 'react'
import cookie from 'cookie'
import Router from 'next/router'
import Link from 'next/link'
import { withAuthSync } from '../lib/auth'
import { FAUNA_SECRET_COOKIE } from '../lib/fauna'
import { getViewerId } from './api/profile'
import Layout from '../components/layout'
import useSWR from 'swr'

const Profile = (props) => {
  const { userId } = props
  const { data, error } = useSWR(`/api/tips?user_id=${userId}`)

  return (
    <Layout>
      <h1>Your profile</h1>
      <p>Your user id is: {userId}</p>

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

    const userId = await getViewerId(faunaSecret)
    return { userId }
  }

  const response = await fetch('/api/profile')

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const data = await response.json()

  // If userId is `null` most likely means the viewer is logged out.
  if (data.userId === null) {
    Router.push('/login')
    return {}
  }

  return { userId: data.userId }
}

export default withAuthSync(Profile)
