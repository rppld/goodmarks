import React from 'react'
import styles from './profile-header.module.css'
import { H4 } from 'components/heading'
import { SmallText } from 'components/text'
import getImageUrl from 'utils/get-image-url'
import Avatar from 'components/avatar'
import Link from 'next/link'
import Button from 'components/button'
import { logout } from 'lib/auth'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useViewer } from 'components/viewer-context'
import Tabs from 'components/tabs'
import Toolbar from 'components/toolbar'
import UnverifiedAccountDialog from 'components/unverified-account-dialog'

const ProfileHeader: React.FC = () => {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { user: handle } = router.query
  const { data, mutate } = useSWR(
    () => handle && `/api/bookmarks?handle=${handle}`
  )
  const { viewer, resetViewer } = useViewer()

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
      console.warn('You are already following this author')
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
      authorId: data?.user?.id,
    }),
  }

  const toggleFollowUser = () => {
    setLoading(true)

    if (viewer) {
      fetch('/api/users?action=follow', fetchOptions)
        .then(handleSuccess)
        .catch(handleError)
    } else {
      router.push('/login')
    }
  }

  async function handleLogout() {
    await logout()
    resetViewer()
  }

  return (
    <>
      <header className={styles.header}>
        <Avatar
          src={data?.user && getImageUrl(data.user.picture, 'avatarLg')}
          size="xl"
        />

        {data?.user?.handle !== undefined ? (
          <div className={styles.userInfo}>
            {data?.user?.name ? (
              <SmallText meta as="p">
                @{data?.user?.handle}
              </SmallText>
            ) : null}
            <H4 as="h1">
              {data?.user?.name ? data.user.name : `@${data?.user?.handle}`}
            </H4>
            {data?.user?.bio ? (
              <SmallText as="p">{data?.user?.bio}</SmallText>
            ) : null}
          </div>
        ) : null}
      </header>

      {viewer ? (
        <Toolbar>
          {handle === viewer.handle ? (
            <>
              <Link href="/settings" passHref>
                <Button as="a" fullWidth>
                  Settings
                </Button>
              </Link>

              <Button onClick={handleLogout} fullWidth>
                Sign out
              </Button>
            </>
          ) : (
            <UnverifiedAccountDialog>
              {(show) => (
                <Button
                  fullWidth
                  onClick={!viewer?.verified ? show : toggleFollowUser}
                  disabled={loading}
                  variant={data?.following ? undefined : 'primary'}
                >
                  {data?.following ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </UnverifiedAccountDialog>
          )}
        </Toolbar>
      ) : null}

      <Tabs
        tabs={[
          {
            linkAs: `/${handle}`,
            linkHref: `/[user]`,
            label: 'Bookmarks',
          },
          {
            linkAs: `/${handle}/lists`,
            linkHref: `/[user]/lists`,
            label: 'Lists',
          },
        ]}
      />
    </>
  )
}

export default ProfileHeader
