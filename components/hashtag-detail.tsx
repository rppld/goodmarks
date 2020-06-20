import React from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { BookmarksData } from 'lib/types'
import BookmarkNode from 'components/bookmark-node'

const HashtagDetail: React.FC = () => {
  const router = useRouter()
  const { hashtag } = router.query
  const { data, error, mutate } = useSWR<BookmarksData>(
    hashtag ? `/api/bookmarks?hashtag=${hashtag}` : null
  )

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

export default HashtagDetail
