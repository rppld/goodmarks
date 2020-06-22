import React from 'react'
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
  return (
    <HStack alignment="leading">
      <Link href="/[user]" as={`/${user.handle}`}>
        <a className="action">
          <Avatar src={user.picture && getImageUrl(user.picture, 'avatarLg')} />
        </a>
      </Link>
      <div className={styles.authorInfo}>
        <Link href="/[user]" as={`/${user.handle}`}>
          <a className="action">
            <SmallText>@{user.handle}</SmallText>
          </a>
        </Link>
        <Caption as="p" meta>
          {createdAt ? <TimeAgo datetime={createdAt} /> : subtitle}
        </Caption>
      </div>
    </HStack>
  )
}

export default AuthorInfo
