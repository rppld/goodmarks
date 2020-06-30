import React from 'react'
import Tabs from './tabs'
import { useViewer } from 'components/viewer-context'

const getItems = (viewer) => {
  let tabs = []

  if (viewer) {
    tabs.push(
      {
        linkHref: `/`,
        linkAs: `/`,
        label: 'Following',
      },
      {
        linkHref: `/popular`,
        linkAs: `/popular`,
        label: 'Popular',
      }
    )
  } else {
    tabs.push({
      linkHref: `/`,
      linkAs: `/`,
      label: 'Popular',
    })
  }

  return [
    ...tabs,
    {
      linkHref: `/latest`,
      linkAs: `/latest`,
      label: 'Latest',
    },
  ]
}

const BookmarksTabs: React.FC = () => {
  const { viewer } = useViewer()
  return <Tabs tabs={getItems(viewer)} />
}

export default BookmarksTabs
