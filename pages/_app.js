import React from 'react'
import { SWRConfig } from 'swr'
import fetch from '../lib/fetch'
import '@reach/combobox/styles.css'
import '@reach/listbox/styles.css'
import '@reach/menu-button/styles.css'
import '../lib/styles.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher: fetch }}>
      <Component {...pageProps} />
    </SWRConfig>
  )
}
