import React from 'react'
import styles from './button.module.css'

const Button = React.forwardRef(
  ({ as: Component, children, variant, leftAdornment, ...props }, ref) => {
    const classList = [styles.base]

    if (variant) {
      classList.push(styles[variant])
    }

    return (
      <Component ref={ref} className={classList.join(' ')} {...props}>
        {leftAdornment ? (
          <span className={styles.adornment}>{leftAdornment}</span>
        ) : null}
        {children}
      </Component>
    )
  }
)

Button.defaultProps = {
  as: 'button',
}

export default Button
