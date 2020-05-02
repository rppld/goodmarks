import React from 'react'
import styles from './page-title.module.css'

const PageTitle = ({ children, ...props }) => {
  return (
    <header className={styles.container} {...props}>
      {children}
    </header>
  )
}

export default PageTitle
