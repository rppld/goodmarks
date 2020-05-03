import React from 'react'
import useSWR, { mutate } from 'swr'
import PageTitle from '../../components/page-title'
import Layout from '../../components/layout'
import { useRouter } from 'next/router'
import Input from '../../components/input'
import Button from '../../components/button'
import Text from '../../components/text'
import { H2 } from '../../components/heading'

const Bookmark = () => {
  const inputRef = React.useRef(null)
  const router = useRouter()
  const { id } = router.query
  // Need to pass a function to see when `id` is ready. Check is
  // required because `useRouter` needs a few ms to be initialized.
  const { data, error } = useSWR(() => id && `/api/bookmarks?id=${id}`)
  const bookmark = data?.bookmarks[0]

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await fetch('/api/comments?action=create', {
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

      <h2>Comments</h2>
      <ul>
        {bookmark?.comments.map((comment) => (
          <li key={comment.ref['@ref'].id}>{comment.text}</li>
        ))}
      </ul>

      <h2>Post a comment</h2>
      <form onSubmit={handleSubmit}>
        <Input
          as="textarea"
          rows="6"
          label="Comment"
          name="comment"
          ref={inputRef}
        />
        <Button type="submit">Post</Button>
      </form>
    </Layout>
  )
}

export default Bookmark
