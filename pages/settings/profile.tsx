import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import SettingsDetail from 'components/settings-detail'

const Settings: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Profile Settings</H4>
        <Text meta>Update your profile.</Text>
      </PageTitle>
      <SettingsDetail />
    </Layout>
  )
}

export default Settings
