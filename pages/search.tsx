import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import SiteSearch from 'components/site-search'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'

const Search: NextPage = () => {
  return (
    <Layout title="Search">
      <PageTitle>
        <H4 as="h1">Search</H4>
        <Text meta>Search people or hashtags.</Text>
      </PageTitle>
      <SiteSearch />
    </Layout>
  )
}

export default Search
