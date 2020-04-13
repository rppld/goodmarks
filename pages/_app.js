import React from 'react'
import '../lib/styles.css'
import { SWRConfig } from 'swr'
import fetch from '../lib/fetch'

export default function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: fetch,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  )
}
