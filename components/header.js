import React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { logout } from '../lib/auth'
import SiteSearch from './site-search'
import Button from './button'
import styles from './header.module.css'

const Header = () => {
  const { data, mutate } = useSWR('/api/profile')
  const isLoggedIn = data?.userId

  async function handleLogout() {
    await logout()
    mutate({ userId: null })
  }

  return (
    <header className={styles.container}>
      <SiteSearch />
      <nav>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link href="/">
              <a className={styles.link}>Home</a>
            </Link>
          </li>

          {isLoggedIn ? (
            <>
              <li className={styles.item}>
                <Link href="/profile">
                  <a className={styles.link}>Profile</a>
                </Link>
              </li>

              <li className={styles.item}>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <li className={styles.item}>
              <Link href="/login">
                <a className={styles.link}>Login</a>
              </Link>
            </li>
          )}

          <li className={styles.item}>
            <Link href="/t/new" passHref>
              <Button as="a">New</Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
