import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import ListsOverview from 'components/lists-overview'
import { useViewer } from 'components/viewer-context'
import Button from 'components/button'
import Link from 'next/link'
import { VStack } from 'components/stack'

const Lists: NextPage = () => {
  const { viewer } = useViewer()

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Lists</H4>
      </PageTitle>

      <VStack spacing="md">
        <ListsOverview handle={viewer?.handle} />

        {viewer?.handle ? (
          <Link href="/lists/new" passHref>
            <Button variant="primary" fullWidth size="lg">
              New list
            </Button>
          </Link>
        ) : null}
      </VStack>
    </Layout>
  )
}

export default Lists
