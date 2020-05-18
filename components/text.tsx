import React from 'react'
import classNames from 'classnames'
import styles from './text.module.css'

interface Props {
  as?: React.ElementType | string
  meta?: boolean
}

const Text: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  children,
  ...props
}) => {
  const className = classNames(styles.hstack, meta && styles.meta)

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export default Text
