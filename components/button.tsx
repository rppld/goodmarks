import React from 'react'
import styles from './button.module.css'

interface Props extends React.ComponentPropsWithoutRef<'button'> {
  as?: React.ElementType | string
  href?: string // When used as `a`
  variant?: string
  leftAdornment?: React.ReactElement
}

const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      as: Component = 'button',
      children,
      variant,
      leftAdornment,
      ...props
    }: Props,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const classList = [styles.base]

    if (variant) {
      classList.push(styles[variant])
    }

    if (React.Children.count(children) === 0) {
      classList.push(styles['no-children'])
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

export default Button
