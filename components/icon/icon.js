import React from 'react'
import styles from './icon.module.css'

const Icon = ({ size = 24, children, a11yTitle, ...props }) => (
  <span className={styles.wrapper} {...props}>
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

export default Icon
