import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { logout } from 'lib/auth'
import Button from './button'
import Avatar from './avatar'
import Header from './header'
import { HStack } from './stack'
import { Plus, MagnifyingGlass } from './icon'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import { useViewer } from 'components/viewer-context'

const DefaultHeader: React.FC = () => {
  const { viewer, resetViewer } = useViewer()

  async function handleLogout() {
    await logout()
    resetViewer()
  }

  return (
    <Header>
      <HStack alignment="space-between">
        <Link href="/" passHref>
          <Button as="a" variant="generic">
            Home
          </Button>
        </Link>

        <HStack>
          <Link href="/search" passHref>
            <Button
              as="a"
              variant="primary"
              leftAdornment={<MagnifyingGlass />}
            >
              Search
            </Button>
          </Link>

          <Link href="/new" passHref>
            <Button as="a" variant="primary" leftAdornment={<Plus />}>
              New
            </Button>
          </Link>

          {viewer ? (
            <Menu>
              <MenuButton>
                <Avatar src={viewer.picture} />
              </MenuButton>
              <MenuList>
                <MenuItem
                  onSelect={() => Router.push('/[user]', `/${viewer.handle}`)}
                >
                  Profile
                </MenuItem>
                <MenuItem onSelect={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link href="/login" passHref>
              <Button as="a">Login</Button>
            </Link>
          )}
        </HStack>
      </HStack>
    </Header>
  )
}

export default DefaultHeader
