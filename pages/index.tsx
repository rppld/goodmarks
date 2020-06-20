import React from 'react'
import { NextPage } from 'next'
import MarketingDetail from 'components/marketing-detail'
import LatestBookmarks from 'components/latest-bookmarks'
import { useViewer } from 'components/viewer-context'

const Home: NextPage = () => {
  const { viewer } = useViewer()

  if (typeof viewer === 'undefined') {
    // Return null while viewer is still loading.
    return null
  }

  if (viewer === null) {
    // Show marketing page to logged-out users.
    return <MarketingDetail />
  }

  // Show latest bookmarks for logged-in users.
  return <LatestBookmarks />
}

export default Home
