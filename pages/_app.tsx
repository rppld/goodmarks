import React from 'react'
import { SWRConfig } from 'swr'
import { useRouter } from 'next/router'
import fetch from 'lib/fetch'
import { AppProps } from 'next/app'
import { ToastContainer, Slide, toast } from 'react-toastify'
import { ViewerProvider } from 'components/viewer-context'
import 'react-toastify/dist/ReactToastify.css'
import '@reach/combobox/styles.css'
import '@reach/listbox/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/checkbox/styles.css'
import '@reach/dialog/styles.css'
import 'lib/styles.css'
import * as ackeeTracker from 'ackee-tracker'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { query } = useRouter()
  const { verified } = query

  React.useEffect(() => {
    const instance = ackeeTracker
      .create(
        {
          server: 'https://analytics.goodmarks.app',
          domainId: '939c31b9-e4a6-4992-a47f-52190cbf195b',
        },
        {
          ignoreLocalhost: true,
          detailed: true,
        }
      )
      .record()

    return () => instance.stop() // Returning a function here will run the handler on unmount.
  }, [])

  React.useEffect(() => {
    if (verified === 'true') {
      toast.success('Your account has been activated')
    } else if (verified === 'error') {
      toast.error('There was an error activating your account')
    }
  }, [verified])

  return (
    <SWRConfig value={{ fetcher: fetch }}>
      <ViewerProvider>
        <Component {...pageProps} />
      </ViewerProvider>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        transition={Slide}
        draggable={false}
        closeButton={false}
      />
    </SWRConfig>
  )
}
