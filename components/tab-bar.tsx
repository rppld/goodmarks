import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Button from './button'
import Avatar from './avatar'
import { Plus, MagnifyingGlass, Bookmark, User, Article } from './icon'
import { useViewer } from 'components/viewer-context'
import styles from './tab-bar.module.css'
import getImageUrl from 'utils/get-image-url'

const TabBar: React.FC = () => {
  const router = useRouter()
  const { viewer } = useViewer()

  function setActiveState(hrefArray: string[]) {
    if (hrefArray.includes(router.pathname)) {
      return clsx(styles.tabItem, styles.active)
    } else {
      return styles.tabItem
    }
  }

  return (
    <div className={styles.container}>
      <ul className={clsx(styles.tabBar)}>
        <li>
          <Link href="/">
            <a className={setActiveState(['/', '/popular', '/latest'])}>
              <Bookmark />
              <span className={styles.label}>Home</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/search">
            <a className={setActiveState(['/search'])}>
              <MagnifyingGlass />
              <span className={styles.label}>Search</span>
            </a>
          </Link>
        </li>
        <li className={styles.newBookmarkItem}>
          <Link href="/b/new">
            <a href="/search" className={setActiveState(['/b/new'])}>
              <Button variant="primary" leftAdornment={<Plus />}>
                <span className={styles.newBookmarkLabel}>New</span>
              </Button>
            </a>
          </Link>
        </li>
        <li>
          {viewer ? (
            <Link href="/lists">
              <a className={setActiveState(['/lists'])}>
                <Article />
                <span className={styles.label}>Lists</span>
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a className={setActiveState(['/lists'])}>
                <Article />
                <span className={styles.label}>Lists</span>
              </a>
            </Link>
          )}
        </li>
        <li>
          {viewer ? (
            <Link href="/[user]" as={`/${viewer.handle}`}>
              <a className={setActiveState(['/[user]', '/[user]/lists'])}>
                <Avatar
                  src={getImageUrl(viewer.picture, 'avatarSm')}
                  size="sm"
                />
                <span className={styles.label}>Profile</span>
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a className={setActiveState(['/login'])}>
                <User />
                <span className={styles.label}>Profile</span>
              </a>
            </Link>
          )}
        </li>
      </ul>
    </div>
  )
}

export default TabBar
