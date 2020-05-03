import React from 'react'
import Link from 'next/link'
import { withAuthSync } from '../lib/auth'
import profileOrRedirect from '../lib/profile-or-redirect'
import PageTitle from '../components/page-title'
import Layout from '../components/layout'
import Text from '../components/text'
import { H2 } from '../components/heading'
import useSWR from 'swr'

const Profile = (props) => {
  const { viewer } = props
  const { data, error } = useSWR(`/api/bookmarks?user=${viewer.id}`)

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Your profile</H2>
        <Text meta>Your user ID is: {viewer.id}</Text>
      </PageTitle>

      <h2>Your bookmarks</h2>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <ol>
          {data.bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
                <a>{bookmark.title}</a>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Layout>
  )
}

Profile.getInitialProps = async (ctx) => {
  const viewer = await profileOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(Profile)
