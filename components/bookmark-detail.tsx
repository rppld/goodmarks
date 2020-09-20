import React from 'react'
import useSWR from 'swr'
import Router from 'next/router'
import * as Yup from 'yup'
import styles from './bookmark-detail.module.css'
import Input from './input'
import Button from './button'
import Form from './form'
import BookmarkNode from './bookmark-node'
import { HStack, VStack } from './stack'
import { SmallText } from './text'
import { useViewer } from './viewer-context'
import { H5 } from './heading'
import { BookmarksData } from 'lib/types'
import { useFormik } from 'formik'
import useDeleteComment from 'utils/use-delete-comment'
import useCreateComment from 'utils/use-create-comment'
import CommentNode from './comment-node'
import Link from 'next/link'

interface Props {
  initialData: BookmarksData
  bookmarkId: string
}

const BookmarkDetail: React.FC<Props> = ({ initialData, bookmarkId }) => {
  const { data, error, mutate } = useSWR<BookmarksData>(
    () => bookmarkId && `/api/bookmarks?id=${bookmarkId}`,
    { initialData }
  )
  const item = data?.edges?.length > 0 && data.edges[0]
  const { comments } = item
  const { viewer } = useViewer()
  const [createComment] = useCreateComment()
  const [deleteComment] = useDeleteComment()
  const validationSchema = Yup.object({
    comment: Yup.string().min(3, 'Your comment must be at least 3 characters'),
  })
  const formik = useFormik({
    initialValues: {
      comment: '',
    },
    onSubmit: handleCreateComment,
    validationSchema,
    validateOnChange: false,
  })

  async function handleLike() {
    const item = data.edges[0]
    const isLiked = item.bookmarkStats.like

    mutate(
      {
        edges: [
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
        edges: [
          {
            ...data.edges[0],
            comments: [
              ...data.edges[0].comments,
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
      edges: [
        {
          ...data.edges[0],
          comments: data.edges[0].comments.filter(
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

          {viewer ? (
            <>
              <H5>Add a comment</H5>
              <Form onSubmit={formik.handleSubmit}>
                <Input
                  as="textarea"
                  rows="4"
                  labelText="Comment"
                  hideLabel
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  help={
                    formik.errors.comment && formik.touched.comment
                      ? String(formik.errors.comment)
                      : undefined
                  }
                  validate={formik.errors.comment ? () => false : undefined}
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
          ) : (
            <>
              <H5>Add a comment</H5>
              <SmallText meta>
                <Link href="/login">Login</Link> or{' '}
                <Link href="/signup">create an account</Link> to add a comment
              </SmallText>
            </>
          )}
        </VStack>
      )}
    </div>
  )
}

export default BookmarkDetail
