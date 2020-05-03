import React from 'react'
import Link from 'next/link'
import { withAuthSync } from '../lib/auth'
import profileOrRedirect from '../lib/profile-or-redirect'
import { Header, HeaderNav, HeaderNavItem } from '../components/header'
import Layout from '../components/layout'
import CategorySelection from '../components/category-selection'
import Button from '../components/button'
import PageTitle from '../components/page-title'
import { H2 } from '../components/heading'
import Text from '../components/text'

const New = ({ viewer }) => {
  return (
    <Layout
      header={
        <Header>
          <HeaderNav />
          <HeaderNav>
            <HeaderNavItem>
              <Link href="/" passHref>
                <Button as="a" variant="danger">
                  Cancel
                </Button>
              </Link>
            </HeaderNavItem>
          </HeaderNav>
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">New bookmark</H2>
        <Text meta>Choose a category.</Text>
      </PageTitle>

      <CategorySelection />
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  const viewer = await profileOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(New)
