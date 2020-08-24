import React from 'react'
import { SWRConfig } from 'swr'
import fetch from 'lib/fetch'
import { AppProps } from 'next/app'
import { ViewerProvider } from 'components/viewer-context'
// import AckeeTracker from 'components/ackee-tracker'
import '@reach/combobox/styles.css'
import '@reach/listbox/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/checkbox/styles.css'
import '@reach/dialog/styles.css'
import 'lib/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* <AckeeTracker></AckeeTracker> */}
      <SWRConfig value={{ fetcher: fetch }}>
        <ViewerProvider>
          <Component {...pageProps} />
        </ViewerProvider>
      </SWRConfig>
    </>
  )
}
