import React from 'react'
import styles from './stack.module.css'

interface Props {
  alignment?: 'leading' | 'center' | 'trailing' | 'space-between'
}

export const HStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  ...props
}) => {
  const classList = [styles.hstack, styles[alignment]]

  return (
    <div className={classList.join(' ')} {...props}>
      {children}
    </div>
  )
}

export const VStack: React.FC<Props> = ({
  children,
  alignment = 'center',
  ...props
}) => {
  const classList = [styles.vstack, styles[alignment]]

  return (
    <div className={classList.join(' ')} {...props}>
      {children}
    </div>
  )
}
