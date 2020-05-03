import React from 'react'
import styles from './input.module.css'

const Input = React.forwardRef(
  ({ as: Component, children, labelText, name, type, ...props }, ref) => (
    <>
      <label htmlFor={name}>{labelText}</label>
      <Component
        ref={ref}
        className={styles.field}
        type={Component === 'input' ? type : undefined}
        name={name}
        id={name}
        {...props}
      />
    </>
  )
)

Input.defaultProps = {
  as: 'input',
  type: 'text',
}

export default Input
