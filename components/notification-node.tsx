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

const ListNode: React.FC<Props> = ({ notification, ...props }) => {
  const getNotificationTitle = function (): String {
    let title = 'Unknown notification'
    let sender = 'Someone'

    if (notification.type === 'NEW_LIKE') {
      title = `${sender} liked your bookmark.`
    } else if (notification.type === 'NEW_COMMENT') {
      title = `${sender} commented on your bookmark.`
    }

    return title
  }

  return (
    <div className={styles.container} {...props}>
      <VStack>
        <H5>{getNotificationTitle()}</H5>
        <SmallText as="p" meta>
          <TimeAgo datetime={notification.created['@ts']} />
        </SmallText>
      </VStack>
    </div>
  )
}

export default ListNode
