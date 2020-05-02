import React from 'react'
import styles from './button.module.css'

const Adornment = (props) => (
  <span className={styles.adornment}>{props.children}</span>
)

const Button = React.forwardRef(
  ({ as: Component, children, variant, leftAdornment, ...props }, ref) => {
    const classList = [styles.base]

    if (variant) {
      classList.push(styles[variant])
    }

    return (
      <Component ref={ref} className={classList.join(' ')} {...props}>
        {leftAdornment ? (
          <Adornment position="left">{leftAdornment}</Adornment>
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
