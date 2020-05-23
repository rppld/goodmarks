import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H2 } from 'components/heading'
import Text from 'components/text'
import PageTitle from 'components/page-title'
import ProfilePictureDropzone from 'components/profile-picture-dropzone'

const Settings: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H2 as="h1">Settings</H2>
        <Text meta>Update your profile.</Text>
      </PageTitle>
      <ProfilePictureDropzone />
    </Layout>
  )
}

export default Settings
