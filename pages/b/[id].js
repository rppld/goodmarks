import React from 'react'
import useSWR, { mutate } from 'swr'
import Router from 'next/router'
import PageTitle from '../../components/page-title'
import Layout from '../../components/layout'
import { useRouter } from 'next/router'
import Input from '../../components/input'
import Button from '../../components/button'
import Text from '../../components/text'
import Form from '../../components/form'
import { MenuBar } from '../../components/menu-bar'
import { H2 } from '../../components/heading'

const Bookmark = () => {
  const inputRef = React.useRef(null)
  const router = useRouter()
  const { id } = router.query
  const { data, error } = useSWR(() => id && `/api/bookmarks?id=${id}`)
  const { bookmark = {}, user = {} } =
    data?.bookmarks?.length > 0 ? data?.bookmarks[0] : {}
  const { data: viewerData = {} } = useSWR('/api/me')
  const showDeleteOption =
    data && viewerData && user?.id === viewerData.viewer?.id

  async function handleDelete() {
    try {
      const response = await fetch(`/api/bookmarks?action=delete&id=${id}`, {
        method: 'POST',
      })

      if (response.ok) {
        Router.push('/')
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await fetch('/api/bookmarks?action=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputRef.current.value,
          entity: {
            id,
            type: 'TIP',
          },
        }),
      })

      // Optimistic store update
      mutate(`/api/bookmarks?id=${id}`, {
        bookmarks: {
          ...data.bookmarks,
          comments: [
            ...data.bookmarks[0].comments,
            {
              '@ref': { id: '12345 ' },
              text: inputRef.current.value,
            },
          ],
        },
      })

      // Reset input value
      inputRef.current.value = ''
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <PageTitle>
          <H2 as="h1">{bookmark.title}</H2>
          <Text meta>{bookmark.description}</Text>
        </PageTitle>
      )}

      {bookmark?.comments?.length > 0 && (
        <>
          <h2>Comments</h2>
          <ul>
            {bookmark.comments.map((comment) => (
              <li key={comment.id}>{comment.text}</li>
            ))}
          </ul>
        </>
      )}

      <h2>Post a comment</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          as="textarea"
          rows="6"
          label="Comment"
          name="comment"
          ref={inputRef}
        />

        <MenuBar>
          <Button type="submit" variant="primary">
            Post
          </Button>
        </MenuBar>
      </Form>

      {showDeleteOption && (
        <>
          <h2>Danger zone</h2>
          <Button variant="danger" onClick={handleDelete}>
            Delete bookmark
          </Button>
        </>
      )}
    </Layout>
  )
}

export default Bookmark
