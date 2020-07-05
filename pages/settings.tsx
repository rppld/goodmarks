import React from 'react'
import { NextPage } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { SmallText } from 'components/text'
import PageTitle from 'components/page-title'
import Link from 'next/link'
import NavList from 'components/nav-list'
import { VStack } from 'components/stack'

const Settings: NextPage = () => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Settings</H4>
      </PageTitle>

      <VStack spacing="md">
        <NavList>
          <Link href="/settings/profile">
            <a>
              <li>Profile settings</li>
            </a>
          </Link>

          <Link href="/settings/notifications">
            <a>
              <li>Notification settings</li>
            </a>
          </Link>
        </NavList>

        <NavList>
          <Link href="/about">
            <a>
              <li>About</li>
            </a>
          </Link>
          <Link href="/contact">
            <a>
              <li>Contact</li>
            </a>
          </Link>
          <Link href="/privacy">
            <a>
              <li>Privacy</li>
            </a>
          </Link>
          <Link href="/terms">
            <a>
              <li>Terms</li>
            </a>
          </Link>
        </NavList>

        <SmallText meta as="p">
          © 2020 Goodmarks
        </SmallText>
      </VStack>
    </Layout>
  )
}

export default Settings
