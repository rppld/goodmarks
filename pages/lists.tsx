import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { VStack } from 'components/stack'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import ListsOverview from 'components/lists-overview'
import { useViewer } from 'components/viewer-context'
import Button from 'components/button'
import Link from 'next/link'

const Lists: NextPage = () => {
  const { viewer } = useViewer()

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Lists</H4>
        {viewer?.handle ? (
          <Text meta>Use lists to collect your favorite bookmarks.</Text>
        ) : (
          <Text meta>
            <Link href="/login">Login</Link> or{' '}
            <Link href="/signup">create an account</Link> to create lists of
            your favorite bookmarks.
          </Text>
        )}
      </PageTitle>

      {viewer?.handle ? (
        <VStack spacing="md">
          <Link href="/lists/new" passHref>
            <Button fullWidth>Create a list</Button>
          </Link>

          <ListsOverview handle={viewer?.handle} />
        </VStack>
      ) : null}
    </Layout>
  )
}

export default Lists
