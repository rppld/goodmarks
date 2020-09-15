import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { useRouter } from 'next/router'
import BookmarksFeed from 'components/bookmarks-feed'

const User: NextPage = () => {
  const router = useRouter()
  const { hashtag } = router.query

  return (
    <Layout title={'#' + hashtag}>
      <PageTitle>
        <H4 as="h1">#{hashtag}</H4>
      </PageTitle>
      {hashtag && <BookmarksFeed hashtag={String(hashtag)} />}
    </Layout>
  )
}

export default User
