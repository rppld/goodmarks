import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'

const PageNotFound: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">404</H4>
        <Text meta>
          The page you’re looking for could have been deleted or moved. Or do
          you maybe have a typo in the URL?
        </Text>
      </PageTitle>
    </Layout>
  )
}

export default PageNotFound
