import React from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import clsx from 'clsx'
import { Error, CheckCircle } from 'components/icon'
import styles from './input.module.css'

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  as?: React.ElementType | string
  hideLabel?: boolean
  help?: React.ReactElement | string
  labelText?: string
  name: string
  placeholder?: string
  type?: string
  rows?: string
  validate?: () => boolean
  showValidationIndicator?: boolean
}

const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      as: Component = 'input',
      hideLabel,
      help,
      labelText,
      name,
      placeholder,
      type = 'text',
      validate,
      showValidationIndicator = false,
      ...props
    },
    ref: React.Ref<HTMLInputElement>
  ) => (
    <span
      className={clsx(
        typeof validate === 'function'
          ? validate()
            ? styles.valid
            : styles.invalid
          : undefined
      )}
    >
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

      <span className={styles.fieldWrapper}>
        <Component
          ref={ref}
          className={styles.field}
          type={Component === 'input' ? type : undefined}
          name={name}
          id={name}
          placeholder={placeholder}
          {...props}
        />

        {typeof validate === 'function' && showValidationIndicator ? (
          <span className={styles.rightAdornment}>
            {validate() ? <CheckCircle /> : <Error />}
          </span>
        ) : null}
      </span>

      {help ? <span className={styles.help}>{help}</span> : null}
    </span>
  )
)

export default Input
