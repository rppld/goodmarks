import React from 'react'
import clsx from 'clsx'
import styles from './page-title.module.css'

interface Props {
  as?: React.ElementType | string
  center?: boolean
  adornment?: React.ReactElement
}

const PageTitle: React.FC<Props> = ({
  children,
  adornment,
  center = false,
  ...props
}) => {
  const className = clsx(styles.container, center && styles.center)

  return (
    <header className={className} {...props}>
      {children}
      {adornment ? <div className={styles.adornment}>{adornment}</div> : null}
    </header>
  )
}

export default PageTitle
