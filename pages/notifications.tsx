import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import Button from 'components/button'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import NotificationsFeed from 'components/notifications-feed'

const Notifications: NextPage = () => {
  return (
    <Layout>
      <PageTitle adornment={<Button size="sm">Mark all as read</Button>}>
        <H4 as="h1">Notifications</H4>
      </PageTitle>
      <NotificationsFeed />
    </Layout>
  )
}

export default Notifications
