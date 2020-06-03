import React from 'react'
import { NextPage } from 'next'
import useSWR from 'swr'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import Bookmark from 'components/bookmark'
import { H2 } from 'components/heading'
import { BookmarksData } from 'lib/types'

const Home: NextPage = () => {
  const { data, error, mutate } = useSWR<BookmarksData>('/api/bookmarks')

  function handleLike(bookmarkId) {
    const newData = {
      bookmarks: data.bookmarks.map((item) => {
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
