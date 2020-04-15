import React from 'react'
import { SWRConfig } from 'swr'
import fetch from '../lib/fetch'
import Header from '../components/header'
import '@reach/combobox/styles.css'
import '../lib/styles.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher: fetch }}>
      <Header />
      <Component {...pageProps} />
    </SWRConfig>
  )
}
