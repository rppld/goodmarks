import React from 'react'
import Head from 'next/head'
import DefaultHeader from './default-header'
import styles from './layout.module.css'

const Layout = ({ title, header, ...props }) => (
  <div className={styles.container}>
    <Head>
      <title>{title}</title>
    </Head>
    {header}
    <main className={styles.main}>{props.children}</main>
  </div>
)

Layout.defaultProps = {
  title: 'Goodmarks',
  header: <DefaultHeader />,
}

export default Layout
