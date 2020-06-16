import React from 'react'
import classNames from 'classnames'
import styles from './profile-page-header.module.css'
import { H2 } from 'components/heading'
import { HStack } from 'components/stack'
import { SmallText } from 'components/text'
import PageTitle from 'components/page-title'
import getImageUrl from 'utils/get-image-url'
import Avatar from 'components/avatar'
import { User } from 'lib/types'

interface Props {
  user: User
}

const ProfilePageHeader: React.FC<Props> = ({ user, children, ...props }) => {
  const className = classNames(styles.header)

  return (
    <header className={className} {...props}>
      {children}

      <HStack alignment="leading" spacing="md">
        <Avatar
          src={user && getImageUrl(user?.picture, 'avatarLg')}
          size="lg"
        />
        <PageTitle>
          <H2 as="h1">{user?.name ? user?.name : user?.handle}</H2>
          <SmallText meta>@{user?.handle}</SmallText>
        </PageTitle>
      </HStack>
    </header>
  )
}

export default ProfilePageHeader
