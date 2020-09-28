import React from 'react'
import clsx from 'clsx'
import styles from './action.module.css'

interface Props extends React.ComponentProps<'button'> {
  as?: React.ElementType | string
  active?: boolean
  leftAdornment?: any
  isLikeToggle?: boolean
}

const Action: React.FC<Props> = ({
  as: Component = 'button',
  active,
  leftAdornment,
  children,
  isLikeToggle,
  className,
  ...props
}) => {
  const isProbablyAButton = Component !== 'span'
  const hasChildren = React.Children.count(children) > 0

  return (
    <Component
      className={clsx(
        className,
        isProbablyAButton ? styles.action : styles.fauxAction,
        isProbablyAButton && active && styles.active,
        isProbablyAButton && isLikeToggle && styles.likeToggle
      )}
      {...props}
    >
      {leftAdornment && (
        <span className={styles.adornment}>{leftAdornment}</span>
      )}

      {hasChildren ? <span className={styles.children}>{children}</span> : null}
    </Component>
  )
}

export default Action
