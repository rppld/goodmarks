import React from 'react'
import Tabs from './tabs'
import { useViewer } from 'components/viewer-context'

const getItems = (viewer) => {
  let tabs = []

  if (viewer) {
    tabs.push(
      {
        href: `/`,
        label: 'Following',
      },
      {
        href: `/popular`,
        label: 'Popular',
      }
    )
  } else {
    tabs.push({
      href: `/`,
      label: 'Popular',
    })
  }

  return [
    ...tabs,
    {
      href: `/latest`,
      label: 'Latest',
    },
  ]
}

const BookmarksTabs: React.FC = () => {
  const { viewer } = useViewer()
  return <Tabs tabs={getItems(viewer)} />
}

export default BookmarksTabs
