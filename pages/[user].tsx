import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import ProfileHeader from 'components/profile-header'
import { useRouter } from 'next/router'
import BookmarksFeed from 'components/bookmarks-feed'

const User: NextPage = () => {
  const router = useRouter()
  const handle = router.query.user

  return (
    <Layout title={handle as string}>
      <ProfileHeader />
      {handle && <BookmarksFeed handle={String(handle)} />}
    </Layout>
  )
}

export default User
