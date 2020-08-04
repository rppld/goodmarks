import React from 'react'
import styles from './notification-button.module.css'
import { Notifications } from 'components/icon'
import Button from 'components/button'
import { useViewer } from './viewer-context'

const NotificationButton = React.forwardRef<HTMLButtonElement>(
  (props, ref: React.Ref<HTMLButtonElement>) => {
    const { viewer } = useViewer()

    return (
      <Button
        as="a"
        size="sm"
        leftAdornment={<Notifications size="xs" />}
        ref={ref}
        {...props}
      >
        Notifications
        {viewer?.hasUnreadNotifications ? (
          <div className={styles.badge}></div>
        ) : null}
      </Button>
    )
  }
)

export default NotificationButton
