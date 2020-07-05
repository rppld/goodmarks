import React from 'react'
import styles from './nav-list.module.css'

const NavList: React.FC = ({ children }) => {
  return <ul className={styles['menu-list']}>{children}</ul>
}

export default NavList
