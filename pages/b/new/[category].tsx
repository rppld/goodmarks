import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import NewBookmarkForm from 'components/new-bookmark-form'

const Category: NextPage = () => {
  const router = useRouter()
  const category = String(router?.query?.category)
  return <NewBookmarkForm category={category} />
}

Category.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(Category)
