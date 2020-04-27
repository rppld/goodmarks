import React from 'react'
import useSWR, { mutate } from 'swr'
import Layout from '../../components/layout'
import { useRouter } from 'next/router'
import Input from '../../components/input'
import Button from '../../components/button'

const Tip = () => {
  const inputRef = React.useRef(null)
  const router = useRouter()
  const { id } = router.query
  // Need to pass a function to see when `id` is ready. Check is
  // required because `useRouter` needs a few ms to be initialized.
  const { data, error } = useSWR(() => id && `/api/tips?id=${id}`)

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await fetch('/api/comments/create', {
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
      mutate(`/api/tips?id=${id}`, {
        tips: {
          ...data.tips,
          comments: [
            ...data.tips[0].comments,
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
      <h1>Tip</h1>
      {error && <div>failed to load</div>}
      {!data ? <div>loading...</div> : <div>{data.tips[0].title}</div>}

      <h2>Comments</h2>
      <ul>
        {data?.tips[0]?.comments.map((comment) => (
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

export default Tip
