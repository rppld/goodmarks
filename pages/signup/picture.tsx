import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import PageTitle from 'components/page-title'
import { HStack, VStack } from 'components/stack'
import Button from 'components/button'
import ProfilePictureDropzone from 'components/profile-picture-dropzone'

const Picture: NextPage = () => {
  const [hasPicture, setHasPicture] = React.useState(false)

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Picture</H4>
        <Text meta>
          Choose a picture that shows up next to your display name.
        </Text>
      </PageTitle>

      <VStack spacing="lg">
        <HStack alignment="center">
          <ProfilePictureDropzone onDrop={() => setHasPicture(true)} />
        </HStack>
        <div>
          <Link href="/b/new?onboarding=true" passHref>
            <Button
              as="a"
              variant={hasPicture ? 'primary' : null}
              size="lg"
              fullWidth
            >
              {hasPicture ? 'Continue' : 'Skip for now'}
            </Button>
          </Link>
        </div>
      </VStack>
    </Layout>
  )
}

export default Picture
