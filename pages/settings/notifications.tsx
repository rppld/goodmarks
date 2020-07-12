import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import NotificationSettingsDetail from 'components/notification-settings-detail'

const Settings: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Notifications</H4>
        <Text meta>Let us know when you want to get notified by email.</Text>
      </PageTitle>
      <NotificationSettingsDetail />
    </Layout>
  )
}

export default Settings
