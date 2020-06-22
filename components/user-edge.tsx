import React from 'react'
import styles from './user-edge.module.css'
import Link from 'next/link'
import { User } from 'lib/types'
import AuthorInfo from './author-info'
import Button from './button'
import { HStack } from './stack'
import useSWR from 'swr'

interface Props {
  user: User
}

const UserEdge: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = React.useState(false)
  const { data, error, mutate } = useSWR(
    () => user.handle && `/api/bookmarks?handle=${user.handle}`
  )

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
      authorId: user.id,
    }),
  }

  const toggleFollowUser = () => {
    setLoading(true)
    fetch('/api/users?action=follow', fetchOptions)
      .then(handleSuccess)
      .catch(handleError)
  }

  return (
    <Link href={`/[user]`} as={`/${user.handle}`}>
      <div className={styles.container}>
        <HStack alignment="space-between">
          <AuthorInfo user={user} subtitle={user.id} />
          <Button onClick={toggleFollowUser} disabled={loading}>
            {data?.following ? 'Unfollow' : 'Follow'}
          </Button>
        </HStack>
      </div>
    </Link>
  )
}

export default UserEdge
