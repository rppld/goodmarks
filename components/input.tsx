import React from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import styles from './input.module.css'

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  as?: React.ElementType | string
  hideLabel?: boolean
  help?: React.ReactElement | string
  labelText?: string
  name: string
  type?: string
  rows?: string
}

const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      as: Component = 'input',
      hideLabel,
      help,
      labelText,
      name,
      type = 'text',
      ...props
    },
    ref: React.Ref<HTMLInputElement>
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

export default Input
