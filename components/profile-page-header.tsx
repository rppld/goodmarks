import React from 'react'
import styles from './profile-page-header.module.css'
import { H4 } from 'components/heading'
import { HStack, VStack } from 'components/stack'
import { Text } from 'components/text'
import getImageUrl from 'utils/get-image-url'
import Avatar from 'components/avatar'
import { User } from 'lib/types'

interface Props {
  user: User
}

const ProfilePageHeader: React.FC<Props> = ({ user, children, ...props }) => {
  return (
    <header className={styles.header} {...props}>
      {children}
      <HStack alignment="leading" spacing="md">
        <Avatar
          src={user && getImageUrl(user?.picture, 'avatarLg')}
          size="lg"
        />
        <VStack spacing="sm">
          <H4 as="h1">{user?.name ? user?.name : user?.handle}</H4>
          <Text meta>@{user?.handle}</Text>
        </VStack>
      </HStack>
    </header>
  )
}

export default ProfilePageHeader
