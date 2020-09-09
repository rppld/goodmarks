import React from 'react'
import { useSWRInfinite } from 'swr'
import BookmarkNode from './bookmark-node'
import { SmallText } from './text'
import InfiniteScrollTrigger from './infinite-scroll-trigger'
import qs from 'querystringify'
import InviteFriends from './invite-friends'
import { useViewer } from './viewer-context'

interface Props {
  cacheKey?: string
  postsPerPage?: number
  handle?: string
  sort?: string
  hashtag?: string
}

const BookmarksFeed: React.FC<Props> = ({
  cacheKey = '/api/bookmarks',
  postsPerPage = 10, // Needs to be greater than 2
  ...props
}) => {
  const { viewer } = useViewer()
  const query = props // Rest of the props are passed as query params.

  const getKey = (pageIndex, previousPageData) => {
    const params = qs.stringify({
      ...query,
      first: postsPerPage,
      after: previousPageData?.pageInfo?.hasNextPage
        ? previousPageData.pageInfo.endCursor
        : 'null',
    })

    // SWR key
    return `${cacheKey}?${params}`
  }

  const { data, error, size, setSize, mutate } = useSWRInfinite(getKey)
  const pages = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')

  const hasOnlyOwnBookmarks = () => {
    let onlyOwnBookmarks = false

    if (viewer) {
      if (data?.[0]?.edges?.length > 0) {
        const filteredData = data?.[0]?.edges.filter((obj) => {
          if (obj.author.handle === viewer.handle) {
            return true
          } else {
            return false
          }
        })

        filteredData.length === data?.[0]?.edges?.length
          ? (onlyOwnBookmarks = true)
          : (onlyOwnBookmarks = false)
      }
    }

    return onlyOwnBookmarks
  }

  const isEmpty = data?.[0]?.edges?.length === 0

  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.edges?.length < postsPerPage)

  function handleLike(pageIndex, bookmarkId) {
    const newData = pages.map((page, index) => {
      if (index === pageIndex) {
        return {
          ...page,
          edges: page.edges.map((item) => {
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
      }
      return page
    })

    mutate(newData, false)
  }

  function handleDelete(pageIndex, bookmarkId) {
    const newData = pages.map((page, index) => {
      if (index === pageIndex) {
        return {
          ...page,
          edges: page.edges.filter((item) => {
            return item.bookmark.id !== bookmarkId
          }),
        }
      }
      return page
    })

    mutate(newData, false)
  }

  const showInviteFriendsBanner = data?.[0]?.edges?.length <= 5 || hasOnlyOwnBookmarks()

  return (
    <>
      {showInviteFriendsBanner ? <InviteFriends /> : null}

      {pages?.length > 0 &&
        pages.map((page, pageIndex) =>
          page.edges.map((node) => (
            <BookmarkNode
              {...node}
              key={node.bookmark.id}
              onLike={() => handleLike(pageIndex, node.bookmark.id)}
              onDelete={() => handleDelete(pageIndex, node.bookmark.id)}
              linkToBookmarkDetail
            />
          ))
        )}

      {!isEmpty ? (
        <InfiniteScrollTrigger
          onIntersect={() => setSize(size + 1)}
          disabled={isReachingEnd || isLoadingMore}
        >
          {isLoadingMore ? (
            <SmallText meta>Loading...</SmallText>
          ) : isReachingEnd ? (
            <SmallText meta>You’ve reached the end.</SmallText>
          ) : null}
        </InfiniteScrollTrigger>
      ) : null}
    </>
  )
}

export default BookmarksFeed
