import React from 'react'
import { SWRConfig } from 'swr'
import fetch from 'lib/fetch'
import { AppProps } from 'next/app'
import { ToastContainer, Slide } from 'react-toastify'
import { ViewerProvider } from 'components/viewer-context'
import 'react-toastify/dist/ReactToastify.css'
import '@reach/combobox/styles.css'
import '@reach/listbox/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/checkbox/styles.css'
import '@reach/dialog/styles.css'
import 'lib/styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{ fetcher: fetch }}>
      <ViewerProvider>
        <Component {...pageProps} />
      </ViewerProvider>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        transition={Slide}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
      />
    </SWRConfig>
  )
}
