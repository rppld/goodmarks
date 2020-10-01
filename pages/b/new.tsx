import React from 'react'
import { NextPage } from 'next'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import Layout from 'components/layout'
import CategorySelection from 'components/category-selection'
import PageTitle from 'components/page-title'
import { H4 } from 'components/heading'
import { Text } from 'components/text'

const New: NextPage = () => {
  return (
    <Layout title="New Bookmark">
      <PageTitle>
        <H4 as="h1">New Bookmark</H4>
        <Text meta>Choose a category for your bookmark.</Text>
      </PageTitle>
      <CategorySelection />
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(New)
