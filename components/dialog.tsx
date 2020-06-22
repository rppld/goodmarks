import React from 'react'
import {
  DialogOverlay,
  DialogContent,
  DialogProps as ReachDialogProps,
} from '@reach/dialog'
import styles from './dialog.module.css'

export interface DialogProps extends ReachDialogProps {
  a11yTitle?: string
}

const Dialog: React.FC<DialogProps> = ({ children, a11yTitle, ...props }) => {
  return (
    <DialogOverlay className={styles.overlay} {...props}>
      <DialogContent className={styles.overlay} aria-label={a11yTitle}>
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}

export default Dialog
