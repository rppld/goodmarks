import React from 'react'
import classNames from 'classnames'
import styles from './page-title.module.css'

interface Props {
  as?: React.ElementType | string
  center?: boolean
}

const PageTitle: React.FC<Props> = ({ children, center = false, ...props }) => {
  const className = classNames(styles.container, center && styles.center)

  return (
    <header className={className} {...props}>
      {children}
    </header>
  )
}

export default PageTitle
