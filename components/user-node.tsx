import React from 'react'
import styles from './user-node.module.css'
import Link from 'next/link'
import { User } from 'lib/types'
import AuthorInfo from './author-info'
import Button from './button'
import { HStack } from './stack'

interface Props {
  user: User
}

const UserNode: React.FC<Props> = ({ user }) => {
  const loading = false
  const following = false

  function toggleFollowUser() {
    console.log('follow User')
  }

  return (
    <Link href={`/[user]`} as={`/${user.handle}`}>
      <div className={styles.container}>
        <HStack alignment="space-between">
          <AuthorInfo user={user} subtitle={user.id} />
          <Button onClick={toggleFollowUser} disabled={loading}>
            {following ? 'Unfollow' : 'Follow'}
          </Button>
        </HStack>
      </div>
    </Link>
  )
}

export default UserNode
