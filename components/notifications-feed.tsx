import React from 'react'
import useSWR, { useSWRPages } from 'swr'
import NotificationNode from './notification-node'
import { SmallText } from './text'
import InfiniteScrollTrigger from './infinite-scroll-trigger'
import { BookmarksData } from 'lib/types'
import qs from 'querystringify'

interface Props {
  postsPerPage?: number
}

const cacheKey = '/api/notifications'

const NotificationsFeed: React.FC<Props> = ({ postsPerPage }) => {
  const { pages, isLoadingMore, isReachingEnd, loadMore } = useSWRPages(
    // page key
    `${cacheKey}`,

    // page component
    ({ offset, withSWR }) => {
      const params = qs.stringify({
        first: postsPerPage,
        after: offset || 'null',
      })

      const { data } = withSWR(
        // use the wrapper to wrap the *pagination API SWR*
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useSWR<BookmarksData>(`${cacheKey}?${params}`)
      )
      // you can still use other SWRs outside

      if (!data) {
        return null
      }

      return data.edges.map(({ notification }) => (
        <NotificationNode key={notification.id} notification={notification} />
      ))
    },

    // one page's SWR => offset of next page
    ({ data }) => {
      return data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : null
    },

    // deps of the page component
    []
  )

  return (
    <>
      {pages}

      <InfiniteScrollTrigger
        onIntersect={loadMore}
        disabled={isReachingEnd || isLoadingMore}
      >
        {isLoadingMore ? (
          <SmallText meta>Loading...</SmallText>
        ) : isReachingEnd ? (
          <SmallText meta>You’ve reached the end.</SmallText>
        ) : null}
      </InfiniteScrollTrigger>
    </>
  )
}

NotificationsFeed.defaultProps = {
  postsPerPage: 10,
}

export default NotificationsFeed
