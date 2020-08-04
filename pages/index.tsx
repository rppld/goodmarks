import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import BookmarksTabs from 'components/bookmarks-tabs'
import BookmarksFeed from 'components/bookmarks-feed'
import JoinGoodmarks from 'components/join-goodmarks'
import { Notifications } from 'components/icon'
import Button from 'components/button'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <Layout>
      <PageTitle
        adornment={
          <Link href="/notifications" passHref>
            <Button
              as="a"
              size="sm"
              leftAdornment={<Notifications size="xs" />}
            >
              Notifications
            </Button>
          </Link>
        }
      >
        <H4 as="h1">Bookmarks</H4>
      </PageTitle>
      <JoinGoodmarks />
      <BookmarksTabs />
      <BookmarksFeed />
    </Layout>
  )
}

export default Home
