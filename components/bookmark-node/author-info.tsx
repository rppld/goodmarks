import React from 'react'
import styles from './author-info.module.css'
import Link from 'next/link'
import Avatar from '../avatar'
import { SmallText, Caption } from '../text'
import TimeAgo from 'timeago-react'
import getImageUrl from 'utils/get-image-url'

interface Props {
  user: any
  createdAt: string
}

const AuthorInfo: React.FC<Props> = ({ user, createdAt }) => {
  return (
    <>
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
        <Caption as="p">
          <TimeAgo datetime={createdAt} />
        </Caption>
      </div>
    </>
  )
}

export default AuthorInfo
