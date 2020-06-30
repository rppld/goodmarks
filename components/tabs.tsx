import React from 'react'
import styles from './tabs.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { stringList } from 'aws-sdk/clients/datapipeline'

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
            className={classNames(
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
