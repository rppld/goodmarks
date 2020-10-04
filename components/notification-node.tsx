import React from 'react'
import listStyles from './list-node.module.css'
import { H5 } from './heading'
import { SmallText } from './text'
import { HStack, VStack } from './stack'
import { NotificationEdge } from 'lib/types'
import styles from './notification-node.module.css'

interface Props {
  notification: NotificationEdge
}

const getNotificationTitle = function (notification: NotificationEdge): String {
  let title = 'Unknown notification'

  if (notification.type === 'NEW_LIKE') {
    title = `@${notification.senderHandle} liked your bookmark`
  } else if (notification.type === 'NEW_COMMENT') {
    title = `@${notification.senderHandle} commented on your bookmark`
  } else if (notification.type === 'NEW_FOLLOW') {
    title = `@${notification.senderHandle} started following you`
  }

  return title
}

const NotificationNode: React.FC<Props> = ({ notification, ...props }) => {
  return (
    <div className={listStyles.container} {...props}>
      <VStack>
        <HStack alignment="space-between">
          <H5>{getNotificationTitle(notification)}</H5>
          {!notification.read && <span className={styles.dot} />}
        </HStack>
        {notification.text && (
          <SmallText as="p" meta>
            {notification.text}
          </SmallText>
        )}
      </VStack>
    </div>
  )
}

export default NotificationNode
