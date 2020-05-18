import React from 'react'
import classNames from 'classnames'
import styles from './stack.module.css'

interface Props {
  alignment?: 'leading' | 'center' | 'trailing' | 'space-between'
  spacing?: 'sm' | 'md' | 'lg'
}

export const HStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  spacing = 'sm',
  ...props
}) => (
  <div
    className={classNames(
      styles.hstack,
      styles[alignment],
      styles[`spacing-${spacing}`]
    )}
    {...props}
  >
    {children}
  </div>
)

export const VStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  spacing = 'sm',
  ...props
}) => (
  <div
    className={classNames(
      styles.vstack,
      styles[alignment],
      styles[`spacing-${spacing}`]
    )}
    {...props}
  >
    {children}
  </div>
)
