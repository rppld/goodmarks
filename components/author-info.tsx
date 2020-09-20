import React from 'react'
import clsx from 'clsx'
import styles from './author-info.module.css'
import Link from 'next/link'
import Avatar from './avatar'
import { SmallText, Caption } from './text'
import TimeAgo from 'timeago-react'
import getImageUrl from 'utils/get-image-url'
import { User } from 'lib/types'
import { HStack } from './stack'

interface Props {
  user: User
  createdAt?: string
  subtitle?: string
}

const AuthorInfo: React.FC<Props> = ({ user, createdAt, subtitle }) => {
  if (!user) return null

  return (
    <HStack alignment="leading">
      <Link href="/[user]" as={`/${user.handle}`}>
        <a>
          <div className={clsx('action', styles.action)}>
            <Avatar
              src={user.picture && getImageUrl(user.picture, 'avatarLg')}
            />
          </div>
        </a>
      </Link>

      <div className={styles.authorInfo}>
        <Link href="/[user]" as={`/${user.handle}`}>
          <a>
            <div className={clsx('action', styles.action)}>
              <SmallText>@{user.handle}</SmallText>
            </div>
          </a>
        </Link>
        <Caption as="p" meta>
          {subtitle}
          {createdAt ? <TimeAgo datetime={createdAt} /> : null}
        </Caption>
      </div>
    </HStack>
  )
}

export default AuthorInfo
