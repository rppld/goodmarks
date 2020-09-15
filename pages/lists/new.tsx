import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import EditListForm from 'components/edit-list-form'

const NewList: NextPage = () => {
  return (
    <Layout title="New List">
      <PageTitle>
        <H4 as="h1">New List</H4>
      </PageTitle>
      <EditListForm />
    </Layout>
  )
}

export default NewList
