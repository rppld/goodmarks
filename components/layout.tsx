import React from 'react'
import Head from 'next/head'
import DefaultHeader from './default-header'
import styles from './layout.module.css'

interface Props {
  title?: string
  header?: React.ReactElement
}

const Layout: React.FC<Props> = ({ title, header, ...props }) => (
  <div className={styles.container} {...props}>
    <Head>
      <title>{title}</title>
      <link rel="stylesheet" href="https://fonts.xz.style/serve/roboto.css" />
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
