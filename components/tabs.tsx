import React from 'react'
import styles from './tabs.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from 'classnames'

interface Tab {
  href: string
  label: string
}

interface Props {
  tabs: Array<Tab>
}

const Tabs: React.FC<Props> = ({ tabs }) => {
  const router = useRouter()

  return (
    <ul className={styles.tabs}>
      {tabs.map((tab) => (
        <Link href={tab.href} as={tab.href} key={tab.href}>
          <a
            className={classNames(
              styles.tab,
              router.asPath.includes(tab.href) ? styles.active : null
            )}
          >
            <li>{tab.label}</li>
          </a>
        </Link>
      ))}
    </ul>
  )
}

export default Tabs
