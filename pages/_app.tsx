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

export default function MyApp({ Component, pageProps }: AppProps) {
  const { query } = useRouter()
  const { verified } = query

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
