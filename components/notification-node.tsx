import React from 'react'
import styles from './list-node.module.css'
import { H5 } from './heading'
import { SmallText } from './text'
import { VStack } from './stack'
import { Notification } from 'lib/types'
import TimeAgo from 'timeago-react'

interface Props {
  notification: Notification
}

const getNotificationTitle = function (notification: Notification): String {
  let title = 'Unknown notification'

  if (notification.type === 'NEW_LIKE') {
    title = 'Your bookmark has a new like'
  } else if (notification.type === 'NEW_COMMENT') {
    title = 'Your bookmark has a new comment'
  }

  return title
}

const NotificationNode: React.FC<Props> = ({ notification, ...props }) => {
  return (
    <div className={styles.container} {...props}>
      <VStack>
        <H5>{getNotificationTitle(notification)}</H5>
        <SmallText as="p" meta>
          <TimeAgo datetime={notification.created['@ts']} />
        </SmallText>
      </VStack>
    </div>
  )
}

export default NotificationNode
