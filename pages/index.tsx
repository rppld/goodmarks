import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import LatestBookmarks from 'components/latest-bookmarks'

const Home: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Latest Bookmarks</H4>
      </PageTitle>
      <LatestBookmarks />
    </Layout>
  )
}

export default Home
