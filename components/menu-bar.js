import React from 'react'
import styles from './menu-bar.module.css'

export const MenuBar = ({ children, ...props }) => {
  const numberOfChildren = React.Children.count(children)
  const classList = [styles.container]

  if (numberOfChildren > 1) {
    classList.push(styles.multiple)
  } else {
    classList.push(styles.single)
  }

  return (
    <div className={classList.join(' ')} {...props}>
      {children}
    </div>
  )
}

export const MenuBarNav = (props) => (
  <nav>
    <ul className={styles.list}>{props.children}</ul>
  </nav>
)

export const MenuBarNavItem = (props) => (
  <li className={styles.item}>{props.children}</li>
)
