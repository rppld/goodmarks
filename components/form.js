import React from 'react'
import styles from './form.module.css'

const Form = ({ children, ...props }) => (
  <form className={styles.container} {...props}>
    {children}
  </form>
)

export default Form
