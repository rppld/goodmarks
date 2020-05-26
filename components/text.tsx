import React from 'react'
import classNames from 'classnames'
import styles from './text.module.css'

interface Props {
  as?: React.ElementType | string
  meta?: boolean
  caption?: boolean
  semibold?: boolean
  bold?: boolean
}

const Text: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  caption = false,
  semibold = false,
  bold = false,
  children,
  ...props
}) => {
  const className = classNames(
    styles.hstack,
    styles.text,
    meta && styles.meta,
    caption && styles.caption,
    semibold && styles.semibold,
    bold && styles.semibold
  )

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export default Text
