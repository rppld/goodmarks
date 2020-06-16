import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { Text } from 'components/text'
import BookmarkEdge from 'components/bookmark-edge'
import Button from 'components/button'
import { HStack, VStack } from 'components/stack'
import { logout } from 'lib/auth'
import { H4 } from 'components/heading'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useViewer } from 'components/viewer-context'
import Tabs from 'components/tabs'

const User: NextPage = () => {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { user: handle } = router.query
  const { data, error, mutate } = useSWR(
    () => handle && `/api/bookmarks?handle=${handle}`
  )
  const { viewer, resetViewer } = useViewer()
  const isViewer = viewer && handle === viewer.handle

  function handleLike(newData) {
    const newBookmarkEdges = data.bookmarks.map((item) => {
      if (item.bookmark.id === newData.bookmarks[0].bookmark.id) {
        return newData.bookmarks[0]
      }
      return item
    })

    mutate({
      bookmarks: newBookmarkEdges,
    })
  }

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
    fetch('/api/users?action=follow', fetchOptions)
      .then(handleSuccess)
      .catch(handleError)
  }

  async function handleLogout() {
    await logout()
    resetViewer()
  }

  const tabs = [
    {
      href: `/${handle}`,
      label: 'Bookmarks',
    },
    {
      href: `/${handle}/lists`,
      label: 'Lists',
    },
    {
      href: `/${handle}/following`,
      label: 'Following',
    },
  ]

  return (
    <Layout>
      <PageTitle>
        <VStack>
          <div>
            <H4 as="h1">
              {data?.author?.name ? data?.author?.name : `@${handle}`}
            </H4>
            {data?.author?.name && (
              <Text meta as="p">
                @{handle}
              </Text>
            )}
          </div>
          {data?.author?.bio && <Text>{data?.author?.bio}</Text>}
        </VStack>
      </PageTitle>

      <HStack alignment="leading">
        {isViewer ? (
          <>
            <Link href="/settings" passHref>
              <Button as="a">Edit profile</Button>
            </Link>

            <Button onClick={handleLogout} variant="danger">
              Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={toggleFollowUser}
            disabled={loading}
            variant={data?.following ? undefined : 'primary'}
          >
            {data?.following ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </HStack>

      <Tabs tabs={tabs} />

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <>
          {data.bookmarks.length > 0 && (
            <>
              {data.bookmarks.map((item) => (
                <BookmarkEdge
                  {...item}
                  key={item.bookmark.id}
                  onLike={handleLike}
                />
              ))}
            </>
          )}
        </>
      )}
    </Layout>
  )
}

export default User
