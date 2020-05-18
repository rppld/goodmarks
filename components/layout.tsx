import React from 'react'
import Head from 'next/head'
import classNames from 'classnames'
import DefaultHeader from './default-header'
import styles from './layout.module.css'

interface Props {
  title?: string
  header?: React.ReactElement | false
}

const Layout: React.FC<Props> = ({ title, header, ...props }) => {
  const className = classNames(styles.main)

  return (
    <div className={styles.container} {...props}>
      <Head>
        <title>{title}</title>
        <link rel="stylesheet" href="https://fonts.xz.style/serve/roboto.css" />
      </Head>
      {header}
      <main className={className}>{props.children}</main>
    </div>
  )
}

Layout.defaultProps = {
  title: 'Goodmarks',
  header: <DefaultHeader />,
}

export default Layout
