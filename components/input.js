import React from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import styles from './input.module.css'

const Input = React.forwardRef(
  (
    {
      as: Component,
      children,
      hideLabel,
      help,
      labelText,
      name,
      type,
      ...props
    },
    ref
  ) => (
    <span className={styles['field-wrapper']}>
      {hideLabel ? (
        <VisuallyHidden>
          <label className={styles.label} htmlFor={name}>
            {labelText}
          </label>
        </VisuallyHidden>
      ) : (
        <label className={styles.label} htmlFor={name}>
          {labelText}
        </label>
      )}

      <Component
        ref={ref}
        className={styles.field}
        type={Component === 'input' ? type : undefined}
        name={name}
        id={name}
        {...props}
      />

      {help ? <span className={styles.help}>{help}</span> : null}
    </span>
  )
)

Input.defaultProps = {
  as: 'input',
  type: 'text',
}

export default Input
