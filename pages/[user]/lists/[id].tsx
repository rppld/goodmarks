import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import ListDetail from 'components/list-detail'
import { ListsData } from 'lib/types'
import { listApi } from 'pages/api/lists'

interface Props {
  initialData: ListsData
  listId: string
}

const Lists: NextPage<Props> = ({ initialData, listId }) => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">List</H4>
      </PageTitle>
      <ListDetail initialData={initialData} listId={listId} />
    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  const { id } = params
  const initialData = await listApi(id)
  return { props: { initialData, listId: id } }
}

export default Lists
