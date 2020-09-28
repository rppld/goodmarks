import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'

const Export: NextPage = () => {
  return (
    <Layout title="Profile data export">
      <PageTitle>
        <H4 as="h1">Profile data export</H4>
      </PageTitle>
      <Text>
        If you’d like to request an export of your Goodmarks profile data,
        please <Link href="/contact">contact us</Link>.
      </Text>
    </Layout>
  )
}

export default Export
