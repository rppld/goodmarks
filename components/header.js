import React from 'react'
import Link from 'next/link'
import { logout } from '../lib/auth'
import styles from './header.module.css'

const Header = () => (
  <header className={styles.container}>
    <nav>
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link href="/">
            <a className={styles.link}>Tips</a>
          </Link>
        </li>
        <li className={styles.item}>
          <Link href="/login">
            <a className={styles.link}>Login</a>
          </Link>
        </li>
        <li className={styles.item}>
          <Link href="/signup">
            <a className={styles.link}>Signup</a>
          </Link>
        </li>
        <li className={styles.item}>
          <Link href="/profile">
            <a className={styles.link}>Profile</a>
          </Link>
        </li>
        <li className={styles.item}>
          <Link href="/tips/new">
            <a className={styles.link}>New</a>
          </Link>
        </li>
        <li className={styles.item}>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  </header>
)

export default Header
