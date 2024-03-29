import React from 'react'
import clsx from 'clsx'
import styles from './icon.module.css'

export interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

interface Props extends IconProps {
  a11yTitle: string
}

const Icon: React.FC<Props> = ({
  size = 'sm',
  children,
  a11yTitle,
  ...props
}) => {
  const className = clsx('icon', styles.wrapper, styles[size])

  return (
    <span className={className} {...props}>
      <svg
        className={styles.svg}
        aria-label={a11yTitle}
        fillRule="evenodd"
        clipRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit="1.414"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
        focusable="false"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
    </span>
  )
}

export default Icon
