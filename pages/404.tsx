import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import Link from 'next/link'

const PageNotFound: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">404 - The page doesn't exist</H4>
        <Text meta>
          The page you're looking for could be deleted or moved. Another common
          cause for this error is typos in the URL.
        </Text>
      </PageTitle>
      <Link href="/">Return to home</Link>
    </Layout>
  )
}

export default PageNotFound
