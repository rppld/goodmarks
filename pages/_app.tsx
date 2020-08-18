import React from 'react'
import { SWRConfig } from 'swr'
import fetch from 'lib/fetch'
import { AppProps } from 'next/app'
import { ViewerProvider } from 'components/viewer-context'
import '@reach/combobox/styles.css'
import '@reach/listbox/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/checkbox/styles.css'
import '@reach/dialog/styles.css'
import 'lib/styles.css'
import { useRouter } from 'next/router'
import useAckee from 'use-ackee'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useAckee(
    router.pathname,
    {
      server: 'http://178.62.216.91',
      domainId: '97d5ad07-d9b7-4f62-870d-d1fcd2d248f6',
    },
    {
      ignoreLocalhost: true,
      detailed: false,
    }
  )

  return (
    <SWRConfig value={{ fetcher: fetch }}>
      <ViewerProvider>
        <Component {...pageProps} />
      </ViewerProvider>
    </SWRConfig>
  )
}
