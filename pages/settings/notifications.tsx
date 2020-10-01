import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import NotificationSettingsDetail from 'components/notification-settings-detail'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import { withAuthSync } from 'lib/auth'

const NotificationSettings: NextPage = () => {
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

NotificationSettings.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(NotificationSettings)
