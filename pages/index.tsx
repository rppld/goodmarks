import React from 'react'
import { NextPage } from 'next'
import useSWR from 'swr'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import Bookmark from 'components/bookmark'
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
        <>
          {data.bookmarks.map((item) => (
            <Bookmark {...item} key={item.bookmark.id} />
          ))}
        </>
      )}
    </Layout>
  )
}

export default Home
