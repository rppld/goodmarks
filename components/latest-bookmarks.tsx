import React from 'react'
import useSWR from 'swr'
import BookmarkNode from 'components/bookmark-node'
import { BookmarksData } from 'lib/types'

const LatestBookmarks: React.FC = () => {
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

  function handleDelete(bookmarkId) {
    const newData = {
      bookmarks: data.bookmarks.filter((item) => {
        return item.bookmark.id !== bookmarkId
      }),
    }

    mutate(newData, false)
  }

  return (
    <>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <div>
          {data.bookmarks.map((item) => (
            <BookmarkNode
              {...item}
              key={item.bookmark.id}
              onLike={() => handleLike(item.bookmark.id)}
              onDelete={() => handleDelete(item.bookmark.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default LatestBookmarks
