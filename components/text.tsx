import React from 'react'
import classNames from 'classnames'
import styles from './text.module.css'

interface Props {
  as?: React.ElementType | string
  meta?: boolean
  semibold?: boolean
  bold?: boolean
}

export const Text: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  semibold = false,
  bold = false,
  children,
  ...props
}) => {
  const className = classNames(
    styles.hstack,
    styles.text,
    meta && styles.meta,
    semibold && styles.semibold,
    bold && styles.semibold
  )

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export const SmallText: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  semibold = false,
  bold = false,
  children,
  ...props
}) => {
  const className = classNames(
    styles.hstack,
    styles.small,
    meta && styles.meta,
    semibold && styles.semibold,
    bold && styles.semibold
  )

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export const CaptionText: React.FC<Props> = ({
  as: Component = 'span',
  meta = false,
  semibold = false,
  bold = false,
  children,
  ...props
}) => {
  const className = classNames(
    styles.hstack,
    styles.caption,
    meta && styles.meta,
    semibold && styles.semibold,
    bold && styles.semibold
  )

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}
