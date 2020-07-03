import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import ListsOverview from 'components/lists-overview'
import { useViewer } from 'components/viewer-context'
import Button from 'components/button'
import Link from 'next/link'
import { HStack } from 'components/stack'
import { Plus } from 'components/icon'

const Lists: NextPage = () => {
  const { viewer } = useViewer()
  const { query } = useRouter()

  return (
    <Layout>
      <PageTitle>
        <HStack alignment="space-between">
          <H4 as="h1">Lists</H4>

          {viewer?.handle ? (
            <Link href="/lists/new" passHref>
              <Button as="a" variant="primary" leftAdornment={<Plus />}>
                New list
              </Button>
            </Link>
          ) : null}
        </HStack>
      </PageTitle>

      <ListsOverview handle={viewer?.handle} />
    </Layout>
  )
}

export default Lists
