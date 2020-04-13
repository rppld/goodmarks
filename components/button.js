import React from 'react'
import styles from './button.module.css'

function Button({ as: Component, children, ...props }) {
  return (
    <Component className={styles.container} {...props}>
      {children}
    </Component>
  )
}

Button.defaultProps = {
  as: 'button',
}

export default Button
