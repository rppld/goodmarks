import React from 'react'
import clsx from 'clsx'
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
    className={clsx(
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
    className={clsx(
      styles.vstack,
      styles[alignment],
      styles[`spacing-${spacing}`]
    )}
    {...props}
  >
    {children}
  </div>
)
