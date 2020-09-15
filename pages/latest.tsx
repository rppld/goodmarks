import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import BookmarksTabs from 'components/bookmarks-tabs'
import BookmarksFeed from 'components/bookmarks-feed'
import JoinGoodmarks from 'components/join-goodmarks'
import Link from 'next/link'
import NotificationButton from 'components/notification-button'
import { useViewer } from 'components/viewer-context'

const Latest: NextPage = () => {
  const { viewer } = useViewer()
  return (
    <Layout title="Latest">
      <PageTitle
        adornment={
          viewer ? (
            <Link href="/notifications" passHref>
              <NotificationButton />
            </Link>
          ) : undefined
        }
      >
        <H4 as="h1">Bookmarks</H4>
      </PageTitle>
      <JoinGoodmarks />
      <BookmarksTabs />
      <BookmarksFeed sort="latest" />
    </Layout>
  )
}

export default Latest
