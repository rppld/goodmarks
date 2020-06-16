import React from 'react'
import Link from 'next/link'
import styles from './author-info.module.css'
import { HStack } from './stack'
import { SmallText, Caption } from './text'
import Avatar from './avatar'
import TimeAgo from 'timeago-react'
import getImageUrl from 'utils/get-image-url'

interface Props {
  user: any
  timestamp: string
}

const AuthorInfo: React.FC<Props> = ({ user, timestamp }) => {
  return (
    <HStack>
      <Link href="/[id]" as={`/${user.handle}`}>
        <a className="action">
          <Avatar src={user.picture && getImageUrl(user.picture, 'avatarLg')} />
        </a>
      </Link>
      <div className={styles.authorInfo}>
        <Link href="/[id]" as={`/${user.handle}`}>
          <a className="action">
            <SmallText>@{user.handle}</SmallText>
          </a>
        </Link>
        <Caption as="p" meta>
          <TimeAgo datetime={timestamp} />
        </Caption>
      </div>
    </HStack>
  )
}

export default AuthorInfo
