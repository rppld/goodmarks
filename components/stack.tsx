import React from 'react'
import classNames from 'classnames'
import styles from './stack.module.css'

interface Props {
  alignment?: 'leading' | 'center' | 'trailing' | 'space-between'
}

export const HStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  ...props
}) => (
  <div className={classNames(styles.hstack, styles[alignment])} {...props}>
    {children}
  </div>
)

export const VStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  ...props
}) => (
  <div className={classNames(styles.vstack, styles[alignment])} {...props}>
    {children}
  </div>
)
