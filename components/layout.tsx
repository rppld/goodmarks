import React from 'react'
import Head from 'next/head'
import DefaultHeader from './default-header'
import styles from './layout.module.css'

interface Props {
  title?: string
  header?: React.ReactElement
}

const Layout: React.FC<Props> = ({
  title = 'Goodmarks',
  header = <DefaultHeader />,
  ...props
}) => (
  <div className={styles.container} {...props}>
    <Head>
      <title>{title}</title>
    </Head>
    {header}
    <main className={styles.main}>{props.children}</main>
  </div>
)

export default Layout
