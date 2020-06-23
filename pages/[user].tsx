import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import BookmarkNode from 'components/bookmark-node'
import Button from 'components/button'
import { logout } from 'lib/auth'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useViewer } from 'components/viewer-context'
import Tabs from 'components/tabs'
import ProfilePageHeader from 'components/profile-page-header'
import Toolbar from 'components/toolbar'
import UserEdge from 'components/user-node'

const User: NextPage = () => {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { user: handle } = router.query
  const { data, error, mutate } = useSWR(
    () => handle && `/api/bookmarks?handle=${handle}`
  )
  const { viewer, resetViewer } = useViewer()

  function handleLike(newData) {
    const newBookmarkNodes = data.bookmarks.map((item) => {
      if (item.bookmark.id === newData.bookmarks[0].bookmark.id) {
        return newData.bookmarks[0]
      }
      return item
    })

    mutate({
      bookmarks: newBookmarkNodes,
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
      <ProfilePageHeader user={data?.author} />

      <Toolbar>
        {viewer && handle !== viewer.handle ? (
          <Button
            fullWidth
            onClick={toggleFollowUser}
            disabled={loading}
            variant={data?.following ? undefined : 'primary'}
          >
            {data?.following ? 'Unfollow' : 'Follow'}
          </Button>
        ) : (
          <>
            <Link href="/settings" passHref>
              <Button as="a" fullWidth>
                Settings
              </Button>
            </Link>

            <Button onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </>
        )}
      </Toolbar>

      <Tabs tabs={tabs} />

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <div>
          <UserEdge user={data?.author} />

          {data.bookmarks.length > 0 && (
            <>
              {data.bookmarks.map((item) => (
                <BookmarkNode
                  {...item}
                  key={item.bookmark.id}
                  onLike={handleLike}
                />
              ))}
            </>
          )}
        </div>
      )}
    </Layout>
  )
}

export default User
