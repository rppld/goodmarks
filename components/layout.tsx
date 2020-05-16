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
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
        rel="stylesheet"
      />
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
