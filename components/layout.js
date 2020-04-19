import React from 'react'
import Head from 'next/head'
import styles from './layout.module.css'

const Layout = ({ title, ...props }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <main>
      <div className={styles.container}>{props.children}</div>
    </main>
  </>
)

Layout.defaultProps = {
  title: 'Goodmarks',
}

export default Layout
