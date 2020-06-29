import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import BookmarksTabs from 'components/bookmarks-tabs'
import BookmarksFeed from 'components/bookmarks-feed'
import JoinGoodmarks from 'components/join-goodmarks'

const Popular: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Bookmarks</H4>
      </PageTitle>
      <JoinGoodmarks />
      <BookmarksTabs />
      <BookmarksFeed cacheKey="/api/bookmarks" query={{ sort: 'popular' }} />
    </Layout>
  )
}

export default Popular
