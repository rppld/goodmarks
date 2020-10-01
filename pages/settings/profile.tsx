import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import SettingsDetail from 'components/settings-detail'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import { withAuthSync } from 'lib/auth'

const ProfileSettings: NextPage = () => {
  return (
    <Layout title="Profile">
      <PageTitle>
        <H4 as="h1">Profile</H4>
        <Text meta>Update your profile.</Text>
      </PageTitle>
      <SettingsDetail />
    </Layout>
  )
}

ProfileSettings.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(ProfileSettings)
