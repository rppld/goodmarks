import React from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import classNames from 'classnames'
import { Error, CheckCircle } from 'components/icon'
import styles from './input.module.css'

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  as?: React.ElementType | string
  hideLabel?: boolean
  help?: React.ReactElement | string
  labelText?: string
  name: string
  type?: string
  rows?: string
  validate?: () => boolean
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
      validate,
      ...props
    },
    ref: React.Ref<HTMLInputElement>
  ) => (
    <span
      className={classNames(
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
          {...props}
        />

        {typeof validate === 'function' && (
          <span className={styles.rightAdornment}>
            {validate() ? <CheckCircle /> : <Error />}
          </span>
        )}
      </span>

      {help ? <span className={styles.help}>{help}</span> : null}
    </span>
  )
)

export default Input
