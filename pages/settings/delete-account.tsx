import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'

const Delete: NextPage = () => {
  return (
    <Layout title="Delete account">
      <PageTitle>
        <H4 as="h1">Delete account</H4>
      </PageTitle>
      <Text>
        If you’d like us to delete your Goodmarks account and have all your data
        erased, please <Link href="/contact">contact us</Link>.
      </Text>
    </Layout>
  )
}

export default Delete
