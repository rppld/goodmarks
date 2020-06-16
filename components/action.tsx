import React from 'react'
import classNames from 'classnames'
import styles from './action.module.css'

interface Props extends React.ComponentProps<'button'> {
  as?: React.ElementType | string
  active?: boolean
  leftAdornment?: any
}

const Action: React.FC<Props> = ({
  as: Component = 'button',
  active,
  leftAdornment,
  children,
  className: passedClassName,
  ...props
}) => {
  const className = classNames(
    passedClassName,
    styles.action,
    active && styles.active
  )

  return (
    <Component className={className} {...props}>
      {leftAdornment && (
        <span className={styles.adornment}>{leftAdornment}</span>
      )}
      {children}
    </Component>
  )
}

export default Action
