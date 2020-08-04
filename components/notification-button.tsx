import React from 'react'
import styles from './notification-button.module.css'
import { Notifications } from 'components/icon'
import Button from 'components/button'

interface Props {
  read?: boolean
}

const NotificationButton: React.FC<Props> = ({ read, children, ...props }) => {
  return (
    <Button
      as="a"
      size="sm"
      leftAdornment={<Notifications size="xs" />}
      {...props}
    >
      Notifications
      {!read ? <div className={styles.badge}></div> : null}
    </Button>
  )
}

export default NotificationButton
