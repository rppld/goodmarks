import React from 'react'
import styles from './menu-list.module.css'

const MenuList: React.FC = ({ children }) => {
  return <ul className={styles['menu-list']}>{children}</ul>
}

export default MenuList
