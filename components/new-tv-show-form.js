import React from 'react'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'
import Link from 'next/link'
import Button from './button'
import Layout from './layout'
import Header from './header'
import { MenuBar, MenuBarNav, MenuBarNavItem } from './menu-bar'
import { ChevronLeft } from './icon'

const NewTVShowForm = () => {
  return (
    <Layout
      header={
        <Header>
          <MenuBar>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/new" passHref>
                  <Button as="a" leftAdornment={<ChevronLeft />}>
                    New bookmark
                  </Button>
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
        <H2 as="h1">TV show</H2>
        <Text meta>Select the TV show you want to bookmark.</Text>
      </PageTitle>
    </Layout>
  )
}

export default NewTVShowForm
