import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import SiteSearch from 'components/site-search'
import { H2 } from 'components/heading'
import Text from 'components/text'
import PageTitle from 'components/page-title'

const Search: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Search</H2>
        <Text meta>Search hashtags or users.</Text>
      </PageTitle>
      <SiteSearch />
    </Layout>
  )
}

export default Search
