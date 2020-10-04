import React from 'react'
import styles from './list-node.module.css'
import { H5 } from './heading'
import { SmallText } from './text'
import { VStack } from './stack'
import { NotificationEdge } from 'lib/types'

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
    <div className={styles.container} {...props}>
      <VStack>
        <H5>{getNotificationTitle(notification)}</H5>
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
