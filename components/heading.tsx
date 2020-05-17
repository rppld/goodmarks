import React from 'react'
import styles from './heading.module.css'

interface Props {
  as?: React.ElementType | string
}

export const H1: React.FC<Props> = ({
  as: Component = 'h1',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-1']} {...props}>
      {children}
    </Component>
  )
}

export const H2: React.FC<Props> = ({
  as: Component = 'h2',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-2']} {...props}>
      {children}
    </Component>
  )
}

export const H3: React.FC<Props> = ({
  as: Component = 'h3',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-3']} {...props}>
      {children}
    </Component>
  )
}

export const H4: React.FC<Props> = ({
  as: Component = 'h4',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-4']} {...props}>
      {children}
    </Component>
  )
}

export const H5: React.FC<Props> = ({
  as: Component = 'h5',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-5']} {...props}>
      {children}
    </Component>
  )
}

export const H6: React.FC<Props> = ({
  as: Component = 'h6',
  children,
  ...props
}) => {
  return (
    <Component className={styles['level-6']} {...props}>
      {children}
    </Component>
  )
}
