import React from 'react'
import Head from 'next/head'
import Header from './header'
import styles from './layout.module.css'

const Layout = (props) => (
  <>
    <Head>
      <title>Friendly Gems</title>
    </Head>
    <Header />
    <main>
      <div className={styles.container}>{props.children}</div>
    </main>
  </>
)

export default Layout
