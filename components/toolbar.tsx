import React from 'react'
import styles from './toolbar.module.css'
import { HStack } from 'components/stack'

const Toolbar: React.FC = ({ children, ...props }) => {
  return (
    <div className={styles.toolbar} {...props}>
      <HStack alignment="leading">{children}</HStack>
    </div>
  )
}

export default Toolbar
