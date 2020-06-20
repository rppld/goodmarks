import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import Button from './button'
import Avatar from './avatar'
import { Plus, MagnifyingGlass, Home, User, List } from './icon'
import { useViewer } from 'components/viewer-context'
import styles from './tab-bar.module.css'
import getImageUrl from 'utils/get-image-url'

const TabBar: React.FC = () => {
  const router = useRouter()
  const { viewer } = useViewer()

  function getTabClassName(href) {
    if (router.pathname.includes(href) || router.asPath.includes(href)) {
      return classNames(styles.tabItem, styles.active)
    }
    return styles.tabItem
  }

  return (
    <div className={styles.container}>
      <ul className={classNames(styles.tabBar)}>
        <li>
          <Link href="/" passHref>
            <a
              className={classNames(
                styles.tabItem,
                router.pathname === '/' ? styles.active : null
              )}
            >
              <Home />
              <span className={styles.label}>Home</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/search" passHref>
            <a className={getTabClassName('/search')}>
              <MagnifyingGlass />
              <span className={styles.label}>Search</span>
            </a>
          </Link>
        </li>
        <li className={styles.newBookmarkItem}>
          <Link href="/new" passHref>
            <a href="/search" className={getTabClassName('/new')}>
              <Button variant="primary" leftAdornment={<Plus />}>
                <span className={styles.newBookmarkLabel}>New</span>
              </Button>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/[user]/lists" as={`/${viewer?.handle}/lists`} passHref>
            <a className={getTabClassName('/lists')}>
              <List />
              <span className={styles.label}>Lists</span>
            </a>
          </Link>
        </li>
        <li>
          {viewer ? (
            <Link href="/[user]" as={`/${viewer.handle}`}>
              <a className={getTabClassName('/[user]')}>
                <Avatar
                  src={getImageUrl(viewer.picture, 'avatarSm')}
                  size="sm"
                />
                <span className={styles.label}>Profile</span>
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a className={getTabClassName('/login')}>
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
