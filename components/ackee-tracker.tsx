import React from 'react'
import { useRouter } from 'next/router'
import useAckee from 'use-ackee'

const AckeeTracker: React.FC = () => {
  const router = useRouter()

  useAckee(
    router.pathname,
    {
      server: 'https://analytics.goodmarks.app',
      domainId: '939c31b9-e4a6-4992-a47f-52190cbf195b',
    },
    {
      ignoreLocalhost: true,
      detailed: true,
    }
  )

  return <></>
}

export default AckeeTracker
