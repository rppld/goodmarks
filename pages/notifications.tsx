import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Notifications as NotificationsIcon } from 'components/icon'
import PageTitle from 'components/page-title'
import NotificationsFeed from 'components/notifications-feed'

const Notifications: NextPage = () => {
  return (
    <Layout>
      <PageTitle adornment={<NotificationsIcon />}>
        <H4 as="h1">Notifications</H4>
      </PageTitle>
      <NotificationsFeed />
    </Layout>
  )
}

export default Notifications
