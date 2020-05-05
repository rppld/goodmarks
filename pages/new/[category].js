import React from 'react'
import { useRouter } from 'next/router'
import { withAuthSync } from '../../lib/auth'
import getViewerOrRedirect from '../../lib/get-viewer-or-redirect'
import NewBookmarkForm from '../../components/new-bookmark-form'

const Category = () => {
  const router = useRouter()
  const { category } = router.query || {}
  return <NewBookmarkForm category={category} />
}

Category.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(Category)
