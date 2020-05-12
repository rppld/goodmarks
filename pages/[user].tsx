import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import Text from 'components/text'
import Button from 'components/button'
import { H2 } from 'components/heading'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { ViewerData } from 'lib/types'

const User: NextPage = () => {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { user: handle } = router.query
  const { data, error, mutate } = useSWR(
    () => handle && `/api/bookmarks?handle=${handle}`
  )
  const { data: viewerData } = useSWR<ViewerData>('/api/me')
  const { viewer } = viewerData || {}

  const safeVerifyError = (error, keys) => {
    if (keys.length > 0) {
      if (error && error[keys[0]]) {
        const newError = error[keys[0]]
        keys.shift()
        return safeVerifyError(newError, keys)
      } else {
        return false
      }
    }
    return error
  }

  function handleError(err) {
    setLoading(false)
    const functionErrorDescription = safeVerifyError(err, [
      'requestResult',
      'responseContent',
      'errors', // The errors of the call
      0,
      'cause', // the underlying cause (the error in the function)
      0,
      'description',
    ])
    if (functionErrorDescription.includes('not unique')) {
      console.warn('You are already folllowing this author')
    } else {
      console.error('Unknown error')
    }
  }

  function handleSuccess(result) {
    setLoading(false)
    mutate({ ...data, following: !data.following })
    console.log('following', result)
  }

  const fetchOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: data?.author?.id,
    }),
  }

  const toggleFollowUser = () => {
    setLoading(true)
    console.log('follow user')
    fetch('/api/users', fetchOptions).then(handleSuccess).catch(handleError)
  }

  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">@{handle}</H2>
        <Text meta>User ID: {data?.author?.id}</Text>
      </PageTitle>

      {viewer && handle !== viewer.handle ? (
        <Button
          onClick={toggleFollowUser}
          disabled={loading}
          variant={data?.following ? undefined : 'primary'}
        >
          {data?.following ? 'Unfollow' : 'Follow'}
        </Button>
      ) : null}

      <h2>Bookmarks</h2>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <>
          {data.bookmarks.length > 0 && (
            <ol>
              {data.bookmarks.map(({ bookmark }) => (
                <li key={bookmark.id}>
                  <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
                    <a>{bookmark.title}</a>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </Layout>
  )
}

export default User