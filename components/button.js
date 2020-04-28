import React from 'react'
import styles from './button.module.css'

const Button = React.forwardRef(
  ({ as: Component, children, ...props }, ref) => {
    return (
      <Component ref={ref} className={styles.container} {...props}>
        {children}
      </Component>
    )
  }
)

Button.defaultProps = {
  as: 'button',
}

export default Button
