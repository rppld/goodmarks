import React from 'react'
import styles from './form.module.css'

interface Props extends React.HTMLProps<HTMLFormElement> {}

const Form: React.FC<Props> = ({ children, ...props }) => (
  <form className={styles.container} {...props}>
    {children}
  </form>
)

export default Form
