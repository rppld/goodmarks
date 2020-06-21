import React from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import Button from 'components/button'
import ListsOverview from 'components/lists-overview'

const Lists: NextPage = () => {
  const { query } = useRouter()

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Lists</H4>
        <Text meta>@{query.user}</Text>
      </PageTitle>

      <Link href="/lists/new" passHref>
        <Button as="a" variant="primary">
          New list
        </Button>
      </Link>

      <ListsOverview />
    </Layout>
  )
}

export default Lists
