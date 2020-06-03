import React from 'react'
import { NextPage } from 'next'
import useSWR, { useSWRPages } from 'swr'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import Bookmark from 'components/bookmark'
import { H2 } from 'components/heading'
import { BookmarksData } from 'lib/types'

const Home: NextPage = () => {
  const { pages, isLoadingMore, isReachingEnd, loadMore } = useSWRPages(
    // page key
    'home-page',

    // page component
    ({ offset, withSWR }) => {
      const { data } = withSWR(
        // use the wrapper to wrap the *pagination API SWR*
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useSWR('/api/bookmarks?first=2&after=' + offset)
      )
      // you can still use other SWRs outside

      if (!data) {
        return <p>loading</p>
      }

      return data.edges.map((node) => (
        <p key={node.bookmark.id}>{node.bookmark.title}</p>
      ))
    },

    // one page's SWR => offset of next page
    ({ data }) => {
      console.log(data)
      return data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : null
    },

    // deps of the page component
    []
  )

  // const { data, error, mutate } = useSWR<BookmarksData>(
  //   '/api/bookmarks?first=2'
  // )

  return (
    <div>
      <h1>Pagination (offset from data)</h1>
      {pages}
      <button onClick={loadMore} disabled={isReachingEnd || isLoadingMore}>
        {isLoadingMore ? '. . .' : isReachingEnd ? 'no more data' : 'load more'}
      </button>
    </div>
  )

  // function handleLike(bookmarkId) {
  //   const newData = {
  //     bookmarks: data.bookmarks.map((item) => {
  //       if (item.bookmark.id === bookmarkId) {
  //         const isLiked = item.bookmarkStats.like
  //         return {
  //           ...item,
  //           bookmark: {
  //             ...item.bookmark,
  //             likes: isLiked
  //               ? item.bookmark.likes - 1
  //               : item.bookmark.likes + 1,
  //           },
  //           bookmarkStats: {
  //             ...item.bookmarkStats,
  //             like: !isLiked,
  //           },
  //         }
  //       }
  //       return item
  //     }),
  //   }

  //   mutate(newData, false)
  // }

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Latest bookmarks</H2>
      </PageTitle>

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <div>
          {data.bookmarks.map((item) => (
            <Bookmark
              {...item}
              key={item.bookmark.id}
              onLike={() => handleLike(item.bookmark.id)}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

export default Home
