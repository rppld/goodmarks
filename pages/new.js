import React from 'react'
import Link from 'next/link'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'lib/get-viewer-or-redirect'
import { MenuBar, MenuBarNav, MenuBarNavItem } from 'components/menu-bar'
import Layout from 'components/layout'
import CategorySelection from 'components/category-selection'
import Button from 'components/button'
import Header from 'components/header'
import PageTitle from 'components/page-title'
import { H2 } from 'components/heading'
import Text from 'components/text'

const New = ({ viewer }) => {
  return (
    <Layout
      header={
        <Header>
          <MenuBar>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/" passHref>
                  <Button as="a">Home</Button>
                </Link>
              </MenuBarNavItem>
            </MenuBarNav>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/" passHref>
                  <Button as="a" variant="danger">
                    Cancel
                  </Button>
                </Link>
              </MenuBarNavItem>
            </MenuBarNav>
          </MenuBar>
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
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(New)
