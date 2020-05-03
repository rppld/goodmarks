import React from 'react'
import styles from './header.module.css'

const Header = (props) => (
  <header className={styles.container}>{props.children}</header>
)

export default Header
