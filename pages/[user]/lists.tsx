import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import ProfileDetail from 'components/profile-detail'
import { useRouter } from 'next/router'
import ListsOverview from 'components/lists-overview'

const User: NextPage = () => {
  const router = useRouter()
  const handle = router.query.user

  return (
    <Layout>
      <ProfileDetail />
      {handle && <ListsOverview handle={String(handle)} />}
    </Layout>
  )
}

export default User
