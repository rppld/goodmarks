import React from 'react'
import * as ackeeTracker from 'ackee-tracker'
import { useRouter } from 'next/router'

const AckeeTracker: React.FC = () => {
  const router = useRouter()

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
      .record({
        siteLocation: router.pathname,
        siteReferrer: document.referrer,
      })
  })

  return <></>
}

export default AckeeTracker
