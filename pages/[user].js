import React from 'react'
import Link from 'next/link'
import PageTitle from '../components/page-title'
import Layout from '../components/layout'
import Text from '../components/text'
import { H2 } from '../components/heading'
import useSWR from 'swr'
import { useRouter } from 'next/router'

const User = () => {
  const router = useRouter()
  const { user: name } = router.query
  const { data, error } = useSWR(
    () => name && `/api/search?context=user&name=${name}`
  )

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">@{data?.user?.name}</H2>
        <Text meta>User ID: {data?.user?.id}</Text>
      </PageTitle>

      <h2>Bookmarks</h2>
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

export default User
