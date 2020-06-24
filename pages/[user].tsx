import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import ProfileDetail from 'components/profile-detail'

const User: NextPage = () => {
  return (
    <Layout>
      <ProfileDetail />
    </Layout>
  )
}

export default User
