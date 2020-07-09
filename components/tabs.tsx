import React from 'react'
import styles from './tabs.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

interface Tab {
  linkHref: string
  linkAs: string
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
        <Link href={tab.linkHref} as={tab.linkAs} key={tab.linkAs}>
          <a
            className={clsx(
              styles.tab,
              router.asPath === tab.linkAs ? styles.active : null
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
