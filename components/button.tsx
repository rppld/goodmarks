import React from 'react'
import classNames from 'classnames'
import styles from './button.module.css'

interface Props extends React.ComponentPropsWithoutRef<'button'> {
  as?: React.ElementType | string
  href?: string // When used as `a`
  variant?: string
  fullWidth?: boolean
  iconOnly?: boolean
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
      iconOnly = false,
      size = 'sm',
      disabled = false,
      leftAdornment,
      ...props
    }: Props,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const className = classNames(
      styles.base,
      styles[size],
      variant && styles[variant],
      fullWidth && styles['full-width'],
      iconOnly && styles['icon-only'],
      disabled && styles.disabled,
      React.Children.count(children) === 0 && styles['no-children']
    )

    return (
      <Component ref={ref} className={className} {...props}>
        {leftAdornment ? (
          <span className={styles.adornment}>{leftAdornment}</span>
        ) : null}

        <span className={styles.label}>{children}</span>
      </Component>
    )
  }
)

export default Button
