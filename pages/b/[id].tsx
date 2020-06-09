import React from 'react'
import { NextPage } from 'next'
import useSWR, { mutate } from 'swr'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import Input from 'components/input'
import Button from 'components/button'
import Form from 'components/form'
import { HStack } from 'components/stack'
import { useViewer } from 'components/viewer-context'
import { H2, H4 } from 'components/heading'
import { BookmarksData } from 'lib/types'
import { useFormik } from 'formik'
import useDeleteBookmark from 'utils/use-delete-bookmark'
import useLikeBookmark from 'utils/use-like-bookmark'
import useDeleteComment from 'utils/use-delete-comment'
import useCreateComment from 'utils/use-create-comment'
import { bookmarkApi } from 'pages/api/bookmarks'

interface Props {
  initialData: BookmarksData
  bookmarkId: string
}

const BookmarkDetail: NextPage<Props> = ({ initialData, bookmarkId }) => {
  const { data, error } = useSWR<BookmarksData>(
    () => bookmarkId && `/api/bookmarks?id=${bookmarkId}`,
    { initialData }
  )
  const manuallyRevalidated = React.useRef(false)
  const item = data?.bookmarks?.length > 0 && data.bookmarks[0]
  const { bookmark, bookmarkStats, user, comments } = item
  const { viewer } = useViewer()
  const isOwnedByViewer = data && viewer && user?.id === viewer.id
  const formik = useFormik({
    initialValues: {
      comment: '',
    },
    onSubmit: handleCreateComment,
  })
  const [deleteBookmark, { loading: deleting }] = useDeleteBookmark()
  const [likeBookmark, { loading: liking }] = useLikeBookmark()
  const [createComment] = useCreateComment()
  const [deleteComment] = useDeleteComment()

  React.useEffect(() => {
    // Manually revalidate upon mount in order to fetch the bookmark
    // stats, e.g. to show whether the viewer likes the bookmark or
    // not. These stats will always be empty at first, because we
    // can’t pass the cookie along inside `getStaticProps()`.
    if (data && viewer && !manuallyRevalidated.current) {
      mutate(`/api/bookmarks?id=${bookmarkId}`)
      manuallyRevalidated.current = true
    }
  }, [data, bookmarkId, viewer])

  async function handleLike() {
    const { bookmarks } = await likeBookmark(bookmarkId)
    mutate(`/api/bookmarks?id=${bookmarkId}`, {
      bookmarks: [
        {
          ...bookmarks[0],
          bookmarkStats: {
            ...bookmarks[0].bookmarkStats,
            like: bookmarks[0].bookmarkStats.like,
          },
        },
      ],
    })
  }

  async function handleCreateComment(values, { resetForm }) {
    try {
      const { comment } = await createComment(values.comment, bookmarkId)
      mutate(`/api/bookmarks?id=${bookmarkId}`, {
        bookmarks: [
          {
            ...data.bookmarks[0],
            comments: [
              ...data.bookmarks[0].comments,
              {
                comment: {
                  id: comment.id,
                  text: comment.text,
                },
                author: {
                  // Using viewer here because author isn’t returned.
                  id: viewer.id,
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
    mutate(`/api/bookmarks?id=${bookmarkId}`, {
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
    <Layout>
      <PageTitle>
        <H2 as="h1">Bookmark</H2>
      </PageTitle>

      {error && <div>failed to load</div>}

      {!data ? <div>loading...</div> : <H4>{bookmark.text}</H4>}

      {viewer && (
        <Button
          onClick={handleLike}
          variant={bookmarkStats?.like ? 'success' : undefined}
          disabled={liking}
        >
          {liking ? 'Loading' : bookmarkStats?.like ? 'Liked' : 'Like'}
        </Button>
      )}

      {comments?.length > 0 && (
        <>
          <h2>Comments</h2>
          <ul>
            {comments.map(({ comment, author }) => (
              <li key={comment.id}>
                {comment.text}{' '}
                {author.id === viewer?.id ? (
                  <button onClick={() => handleDeleteComment(comment.id)}>
                    [×]
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      {viewer && (
        <>
          <h2>Post a comment</h2>
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

            <HStack alignment="trailing">
              <Button
                type="submit"
                variant="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Posting' : 'Post'}
              </Button>
            </HStack>
          </Form>
        </>
      )}

      {isOwnedByViewer && (
        <>
          <h2>Danger zone</h2>
          <Button
            variant="danger"
            onClick={() => deleteBookmark(bookmarkId)}
            disabled={deleting}
          >
            {deleting ? 'Deleting' : 'Delete bookmark'}
          </Button>
        </>
      )}
    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  const { id } = params
  const initialData = await bookmarkApi(id)
  return { props: { initialData, bookmarkId: id } }
}

export default BookmarkDetail
