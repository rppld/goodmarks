import React from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import Layout from 'components/layout'
import CategorySelection from 'components/category-selection'
import Button from 'components/button'
import Header from 'components/header'
import PageTitle from 'components/page-title'
import { H2 } from 'components/heading'
import { HStack } from 'components/stack'
import Text from 'components/text'

const New: NextPage = () => {
  return (
    <Layout
      header={
        <Header>
          <HStack alignment="space-between">
            <Link href="/" passHref>
              <Button as="a">Home</Button>
            </Link>
            <Link href="/" passHref>
              <Button as="a" variant="danger">
                Cancel
              </Button>
            </Link>
          </HStack>
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">New bookmark</H2>
        <Text meta>Choose a category.</Text>
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
