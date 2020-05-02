import React from 'react'
import styles from './heading.module.css'

export const H1 = ({ as: Component, children, ...props }) => {
  return (
    <Component className={styles['level-1']} {...props}>
      {children}
    </Component>
  )
}

H1.defaultProps = {
  as: 'h1',
}

export const H2 = ({ as: Component, children, ...props }) => {
  return (
    <Component className={styles['level-2']} {...props}>
      {children}
    </Component>
  )
}

H2.defaultProps = {
  as: 'h2',
}

export const H3 = ({ as: Component, children, ...props }) => {
  return (
    <Component className={styles['level-3']} {...props}>
      {children}
    </Component>
  )
}

H3.defaultProps = {
  as: 'h3',
}
