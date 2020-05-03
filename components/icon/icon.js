import React from 'react'
import styles from './icon.module.css'

const Icon = ({ size, children, a11yTitle, ...props }) => {
  const classList = ['icon', styles.wrapper, styles[size]]

  return (
    <span className={classList.join(' ')} {...props}>
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

Icon.defaultProps = {
  size: 'sm',
}

export default Icon
