import React from 'react'
import styles from './menu-bar.module.css'

export const MenuBar: React.FC = ({ children, ...props }) => {
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

export const MenuBarNav: React.FC = (props) => (
  <nav>
    <ul className={styles.list}>{props.children}</ul>
  </nav>
)

export const MenuBarNavItem: React.FC = (props) => (
  <li className={styles.item}>{props.children}</li>
)
