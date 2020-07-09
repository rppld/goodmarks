import React from 'react'
import clsx from 'clsx'
import styles from './text.module.css'

interface Props {
  as?: React.ElementType | string
  meta?: boolean
  className?: string
}

export const Text: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  children,
  className,
  ...props
}) => {
  return (
    <Component
      className={clsx(className, styles.text, meta && styles.meta)}
      {...props}
    >
      {children}
    </Component>
  )
}

export const SmallText: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  children,
  ...props
}) => {
  const className = clsx(styles.hstack, styles.small, meta && styles.meta)

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export const Caption: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  children,
  ...props
}) => {
  const className = clsx(styles.caption, meta && styles.meta)

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}
