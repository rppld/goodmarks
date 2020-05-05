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
  const { user: handle } = router.query
  console.log(handle)
  const { data, error } = useSWR(
    () => handle && `/api/bookmarks?handle=${handle}`
  )

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">@{handle}</H2>
        <Text meta>User ID: {data?.author?.id}</Text>
      </PageTitle>

      <h2>Bookmarks</h2>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <>
          {data.bookmarks.length > 0 && (
            <ol>
              {data.bookmarks.map(({ bookmark }) => (
                <li key={bookmark.id}>
                  <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
                    <a>{bookmark.title}</a>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </Layout>
  )
}

export default User
