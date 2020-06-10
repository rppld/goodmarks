import React from 'react'
import Head from 'next/head'
import styles from './layout.module.css'
import TabBar from './tab-bar'

interface Props {
  title?: string
}

const Layout: React.FC<Props> = ({ title, ...props }) => (
  <div className={styles.container} {...props}>
    <Head>
      <title>{title}</title>
      <link rel="stylesheet" href="https://fonts.xz.style/serve/roboto.css" />
    </Head>
    <header role="banner" className={styles.sidebar}>
      <TabBar />
    </header>
    <main className={styles.main}>{props.children}</main>
  </div>
)

Layout.defaultProps = {
  title: 'Goodmarks',
}

export default Layout
