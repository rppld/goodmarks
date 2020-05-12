import React from 'react'
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
  const classList = [styles.text]

  if (meta) {
    classList.push(styles.meta)
  }

  return (
    <Component className={classList.join(' ')} {...props}>
      {children}
    </Component>
  )
}

export default Text
