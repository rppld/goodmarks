import React from 'react'
import { NextPage } from 'next'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import Layout from 'components/layout'
import CategorySelection from 'components/category-selection'
import PageTitle from 'components/page-title'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import { useRouter } from 'next/router'

const New: NextPage = () => {
  const { query } = useRouter()
  const onboarding = query.onboarding ? true : false

  return (
    <Layout title="New Bookmark">
      <PageTitle>
        <H4 as="h1">
          {!onboarding ? 'New Bookmark' : "Let's create your first bookmark"}
        </H4>
        <Text meta>
          {!onboarding ? 'Choose a category for your bookmark.' : "Bookmarks are pieces of content that you share with your followers. Before creating one, you will have to select the category."}
        </Text>
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
