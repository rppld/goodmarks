import React from 'react'
import Link from 'next/link'
import { logout } from '../lib/auth'
import styles from './header.module.css'

const links = [
  { text: 'Tips', href: '/' },
  { text: 'Login', href: '/login' },
  { text: 'Signup', href: '/signup' },
  { text: 'Profile', href: '/profile' },
  { text: 'New', href: '/tips/new' },
]

const Header = () => (
  <header className={styles.container}>
    <nav>
      <ul className={styles.list}>
        {links.map((link) => (
          <li className={styles.item} key={link.href}>
            <Link href={link.href}>
              <a className={styles.link}>{link.text}</a>
            </Link>
          </li>
        ))}
        <li className={styles.item}>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  </header>
)

export default Header
