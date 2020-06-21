import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import NewListForm from 'components/new-list-form'

const NewList: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">New List</H4>
      </PageTitle>
      <NewListForm />
    </Layout>
  )
}

export default NewList
