import React from 'react'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H2 } from 'components/heading'
import { useRouter } from 'next/router'

const User = () => {
  const router = useRouter()
  const { hashtag } = router.query

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">#{hashtag}</H2>
      </PageTitle>
    </Layout>
  )
}

export default User
