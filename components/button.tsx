import React from 'react'
import clsx from 'clsx'
import styles from './button.module.css'

interface Props extends React.ComponentPropsWithoutRef<'button'> {
  as?: React.ElementType | string
  href?: string // When used as `a`
  variant?: string
  fullWidth?: boolean
  size?: 'sm' | 'lg'
  disabled?: boolean
  leftAdornment?: React.ReactElement
}

const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      as: Component = 'button',
      children,
      variant,
      fullWidth = false,
      size = 'sm',
      disabled = false,
      leftAdornment,
      ...props
    }: Props,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const className = clsx(
      styles.base,
      styles[size],
      variant && styles[variant],
      fullWidth && styles['full-width'],
      disabled && styles.disabled,
      React.Children.count(children) === 0 && styles['no-children']
    )

    return (
      <Component ref={ref} className={className} {...props}>
        {leftAdornment ? (
          <span className={styles.adornment}>{leftAdornment}</span>
        ) : null}
        {children}
      </Component>
    )
  }
)

export default Button
