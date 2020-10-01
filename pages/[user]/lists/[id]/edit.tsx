import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import EditListForm from 'components/edit-list-form'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import { withAuthSync } from 'lib/auth'

const EditList: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Edit List</H4>
      </PageTitle>
      <EditListForm />
    </Layout>
  )
}

EditList.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(EditList)
