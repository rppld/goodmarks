import React from 'react'
import { NextPage } from 'next'
import useSWR from 'swr'
import Link from 'next/link'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H2 } from 'components/heading'
import { BookmarksData } from 'lib/types'

const Home: NextPage = () => {
  const { data, error } = useSWR<BookmarksData>('/api/bookmarks')

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Latest bookmarks</H2>
      </PageTitle>

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
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
    </Layout>
  )
}

export default Home
