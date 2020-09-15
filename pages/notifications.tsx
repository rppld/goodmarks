import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import Button from 'components/button'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import { Checkmark } from 'components/icon'
import Link from 'next/link'
import { VStack } from 'components/stack'
import { useSWRInfinite, trigger } from 'swr'
import NotificationNode from 'components/notification-node'
import { SmallText } from 'components/text'
import InfiniteScrollTrigger from 'components/infinite-scroll-trigger'
import qs from 'querystringify'

const CACHE_KEY = '/api/notifications'
const PAGE_SIZE = 10 // Needs to be greater than 2

const getKey = (pageIndex, previousPageData) => {
  const params = qs.stringify({
    first: PAGE_SIZE,
    after: previousPageData?.pageInfo?.hasNextPage
      ? previousPageData.pageInfo.endCursor
      : 'null',
    read: false,
  })

  // SWR key
  return `${CACHE_KEY}?${params}`
}

const Notifications: NextPage = () => {
  const { data, error, size, setSize, revalidate } = useSWRInfinite(getKey)
  const pages = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.edges?.length === 0
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.edges?.length < PAGE_SIZE)

  const handleMarkAsRead = async (
    id?: string,
    shouldRevalidate: boolean = false
  ) => {
    try {
      const response = await fetch('/api/notifications?action=mark_as_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
        }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      if (shouldRevalidate) {
        revalidate()
      }

      // Always revalidate viewer
      trigger('/api/me')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout title="Notifications">
      <PageTitle
        adornment={
          !isEmpty ? (
            <Button
              size="sm"
              leftAdornment={<Checkmark size="xs" />}
              onClick={() => handleMarkAsRead(null, true)}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      >
        <H4 as="h1">Notifications</H4>
      </PageTitle>

      {pages?.length > 0 ? (
        <VStack spacing="md">
          {pages.map((page) =>
            page.edges.map(({ notification }) => (
              <div key={notification.id}>
                <Link
                  href="/b/[id]"
                  as={`/b/${notification.object['@ref'].id}`}
                >
                  <a onClick={() => handleMarkAsRead(notification.id)}>
                    <NotificationNode
                      key={notification.id}
                      notification={notification}
                    />
                  </a>
                </Link>
              </div>
            ))
          )}
        </VStack>
      ) : null}

      <InfiniteScrollTrigger
        onIntersect={() => setSize(size + 1)}
        disabled={isReachingEnd || isLoadingMore}
      >
        {isEmpty ? (
          <SmallText meta>You don’t have any notifications.</SmallText>
        ) : isLoadingMore ? (
          <SmallText meta>Loading...</SmallText>
        ) : isReachingEnd ? (
          <SmallText meta>You’ve reached the end.</SmallText>
        ) : null}
      </InfiniteScrollTrigger>
    </Layout>
  )
}

export default Notifications
