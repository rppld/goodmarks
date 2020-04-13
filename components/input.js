import React from 'react'
import styles from './input.module.css'

function Input({ as: Component, children, labelText, name, type, ...props }) {
  return (
    <>
      <label htmlFor={name}>{labelText}</label>
      <Component
        className={styles.container}
        type={Component === 'input' ? type : undefined}
        name={name}
        id={name}
        {...props}
      >
        {children}
      </Component>
    </>
  )
}

Input.defaultProps = {
  as: 'input',
  type: 'text',
}

export default Input
