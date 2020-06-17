import React from 'react'
import useSWR from 'swr'
import Router from 'next/router'
import styles from './bookmark-detail.module.css'
import Input from './input'
import Button from './button'
import Form from './form'
import BookmarkNode from './bookmark-node'
import { HStack, VStack } from './stack'
import { useViewer } from './viewer-context'
import { H5 } from './heading'
import { BookmarksData } from 'lib/types'
import { useFormik } from 'formik'
import useDeleteComment from 'utils/use-delete-comment'
import useCreateComment from 'utils/use-create-comment'
import CommentNode from './comment-node'

interface Props {
  initialData: BookmarksData
  bookmarkId: string
}

const BookmarkDetail: React.FC<Props> = ({ initialData, bookmarkId }) => {
  const { data, error, mutate } = useSWR<BookmarksData>(
    () => bookmarkId && `/api/bookmarks?id=${bookmarkId}`,
    { initialData }
  )
  const manuallyRevalidated = React.useRef(false)
  const item = data?.bookmarks?.length > 0 && data.bookmarks[0]
  const { comments } = item
  const { viewer } = useViewer()
  const formik = useFormik({
    initialValues: {
      comment: '',
    },
    onSubmit: handleCreateComment,
  })
  const [createComment] = useCreateComment()
  const [deleteComment] = useDeleteComment()

  React.useEffect(() => {
    // Manually revalidate upon mount in order to fetch the bookmark
    // stats, e.g. to show whether the viewer likes the bookmark or
    // not. These stats will always be empty at first, because we
    // can’t pass the cookie along inside `getStaticProps()`.
    if (data && viewer && !manuallyRevalidated.current) {
      mutate()
      manuallyRevalidated.current = true
    }
  }, [data, bookmarkId, viewer, mutate])

  async function handleLike() {
    const item = data.bookmarks[0]
    const isLiked = item.bookmarkStats.like

    mutate(
      {
        bookmarks: [
          {
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
          },
        ],
      },
      false
    )
  }

  async function handleCreateComment(values, { resetForm }) {
    try {
      const { comment } = await createComment(values.comment, bookmarkId)
      mutate({
        bookmarks: [
          {
            ...data.bookmarks[0],
            comments: [
              ...data.bookmarks[0].comments,
              {
                comment: {
                  id: comment.id,
                  text: comment.text,
                  created: {
                    '@ts': Date.now(),
                  },
                },
                author: {
                  // Using viewer here because author isn’t returned.
                  ...viewer,
                },
              },
            ],
          },
        ],
      })
      resetForm()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteComment(commentId) {
    const res = await deleteComment(commentId)
    mutate({
      bookmarks: [
        {
          ...data.bookmarks[0],
          comments: data.bookmarks[0].comments.filter(
            ({ comment }) => comment.id !== res.comment.id
          ),
        },
      ],
    })
  }

  return (
    <div className={styles.container}>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <VStack spacing="md">
          <BookmarkNode
            {...item}
            onLike={handleLike}
            onDelete={() => Router.push('/')}
          />

          {comments?.length > 0 && (
            <>
              <H5>Comments</H5>
              <ul className={styles.commentsList}>
                {comments.map(({ comment, author }) => (
                  <li key={comment.id}>
                    <CommentNode
                      author={author}
                      comment={comment}
                      onDelete={handleDeleteComment}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}

          {viewer && (
            <>
              <H5>Add a comment</H5>
              <Form onSubmit={formik.handleSubmit}>
                <Input
                  as="textarea"
                  rows="6"
                  labelText="Comment"
                  hideLabel
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                />

                <footer>
                  <HStack alignment="trailing">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? 'Posting' : 'Post'}
                    </Button>
                  </HStack>
                </footer>
              </Form>
            </>
          )}
        </VStack>
      )}
    </div>
  )
}

export default BookmarkDetail
