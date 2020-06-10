import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { useRouter } from 'next/router'

const User: NextPage = () => {
  const router = useRouter()
  const { hashtag } = router.query

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">#{hashtag}</H4>
      </PageTitle>
    </Layout>
  )
}

export default User
