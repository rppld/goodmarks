import React from 'react'
import styles from './header.module.css'

export const Header = (props) => (
  <header className={styles.container}>{props.children}</header>
)

export const HeaderNav = (props) => (
  <nav>
    <ul className={styles.list}>{props.children}</ul>
  </nav>
)

export const HeaderNavItem = (props) => (
  <li className={styles.item}>{props.children}</li>
)
