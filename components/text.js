import React from 'react'
import styles from './text.module.css'

const Text = ({ as: Component, meta, children, ...props }) => {
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

Text.defaultProps = {
  as: 'span',
  meta: false,
}

export default Text
