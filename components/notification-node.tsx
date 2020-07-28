import React from 'react'
import styles from './list-node.module.css'
import { H4 } from './heading'
import { Text } from './text'
import { VStack } from './stack'
import { Notification } from 'lib/types'

interface Props {
  notification: Notification
}

const ListNode: React.FC<Props> = ({ notification, ...props }) => {
  return (
    <div className={styles.container} {...props}>
      <VStack>
        <H4>{notification.type}</H4>
        <Text as="p">{notification.objectUrl}</Text>
      </VStack>
    </div>
  )
}

export default ListNode
