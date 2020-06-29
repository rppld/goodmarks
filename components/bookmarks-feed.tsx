import React from 'react'
import useSWR, { useSWRPages } from 'swr'
import BookmarkNode from './bookmark-node'
import { SmallText } from './text'
import InfiniteScrollTrigger from './infinite-scroll-trigger'
import { BookmarksData } from 'lib/types'
import qs from 'querystringify'

interface Props {
  cacheKey: string
  query?: any
}

const BookmarksFeed: React.FC<Props> = ({ cacheKey, query }) => {
  const postsPerPage = 10
  const { pages, isLoadingMore, isReachingEnd, loadMore } = useSWRPages(
    // page key
    `${cacheKey}?${qs.stringify(query)}`,

    // page component
    ({ offset, withSWR }) => {
      const params = qs.stringify({
        ...query,
        first: postsPerPage,
        after: offset || 'null',
      })

      const { data, mutate } = withSWR(
        // use the wrapper to wrap the *pagination API SWR*
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useSWR<BookmarksData>(`${cacheKey}?${params}`)
      )
      // you can still use other SWRs outside

      function handleLike(bookmarkId) {
        const newData = {
          ...data,
          bookmarks: data.edges.map((item) => {
            if (item.bookmark.id === bookmarkId) {
              const isLiked = item.bookmarkStats.like
              return {
                ...item,
                bookmark: {
                  ...item.bookmark,
                  likes: isLiked
                    ? item.bookmark.likes - 1
                    : item.bookmark.likes + 1,
                },
                bookmarkStats: {
                  ...item.bookmarkStats,
                  like: !isLiked,
                },
              }
            }
            return item
          }),
        }

        mutate(newData, false)
      }

      function handleDelete(bookmarkId) {
        const newData = {
          ...data,
          bookmarks: data.edges.filter((item) => {
            return item.bookmark.id !== bookmarkId
          }),
        }

        mutate(newData, false)
      }

      if (!data) {
        return null
      }

      return data.edges.map((node) => (
        <BookmarkNode
          {...node}
          key={node.bookmark.id}
          onLike={() => handleLike(node.bookmark.id)}
          onDelete={() => handleDelete(node.bookmark.id)}
          linkToBookmarkDetail
        />
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

export default BookmarksFeed
