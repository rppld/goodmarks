import React from 'react'
import Link from 'next/link'
import Button from './button'
import { H1, H2 } from './heading'
import { VStack } from './stack'
import styles from './marketing-detail.module.css'

const MarketingDetail: React.FC = () => {
  return (
    <div className={styles.container}>
      <VStack>
        <hgroup>
          <H1>Goodmarks</H1>
          <H2>Human recommendations, no algorithm.</H2>
        </hgroup>
        <Link href="/login" passHref>
          <Button as="a" variant="primary">
            Log in
          </Button>
        </Link>
      </VStack>
    </div>
  )
}

export default MarketingDetail
