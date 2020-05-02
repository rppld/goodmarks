import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import useSWR from 'swr'
import { logout } from '../lib/auth'
import Button from './button'
import Avatar from './avatar'
import { Header, HeaderNav, HeaderNavItem } from './header'
import SiteSearch from './site-search'
import { Plus } from './icon'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

const DefaultHeader = () => {
  const { data = {}, mutate } = useSWR('/api/me')
  const { viewer } = data

  async function handleLogout() {
    await logout()
    mutate({ viewer: null })
  }

  return (
    <Header>
      <HeaderNav>
        <HeaderNavItem>
          <Link href="/" passHref>
            <Button as="a" variant="generic">
              Home
            </Button>
          </Link>
        </HeaderNavItem>
      </HeaderNav>

      <HeaderNav>
        <HeaderNavItem>
          <SiteSearch />
        </HeaderNavItem>

        <HeaderNavItem>
          <Link href="/new" passHref>
            <Button as="a" variant="primary" leftAdornment={<Plus />}>
              New
            </Button>
          </Link>
        </HeaderNavItem>

        {viewer ? (
          <HeaderNavItem>
            <Menu>
              <MenuButton>
                <Avatar src={viewer.picture} />
              </MenuButton>
              <MenuList>
                <MenuItem onSelect={() => Router.push('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onSelect={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HeaderNavItem>
        ) : (
          <HeaderNavItem>
            <Link href="/login" passHref>
              <Button as="a">Login</Button>
            </Link>
          </HeaderNavItem>
        )}
      </HeaderNav>
    </Header>
  )
}

export default DefaultHeader