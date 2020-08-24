import React from 'react'
import * as ackeeTracker from 'ackee-tracker'

const AckeeTracker: React.FC = () => {
  let instance = null

  if (typeof window !== 'undefined') {
    instance = ackeeTracker
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
  }

  return <></>
}

export default AckeeTracker
