import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { logout } from 'lib/auth'
import Button from './button'
import Avatar from './avatar'
import Header from './header'
import { MenuBar, MenuBarNav, MenuBarNavItem } from './menu-bar'
import { Plus, MagnifyingGlass } from './icon'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import { useViewer } from 'components/viewer-context'

const DefaultMenuBar: React.FC = () => {
  const { viewer, resetViewer } = useViewer()

  async function handleLogout() {
    await logout()
    resetViewer()
  }

  return (
    <Header>
      <MenuBar>
        <MenuBarNav>
          <MenuBarNavItem>
            <Link href="/" passHref>
              <Button as="a" variant="generic">
                Home
              </Button>
            </Link>
          </MenuBarNavItem>
        </MenuBarNav>

        <MenuBarNav>
          <MenuBarNavItem>
            <Link href="/search" passHref>
              <Button
                as="a"
                variant="primary"
                leftAdornment={<MagnifyingGlass />}
              >
                Search
              </Button>
            </Link>
          </MenuBarNavItem>

          <MenuBarNavItem>
            <Link href="/new" passHref>
              <Button as="a" variant="primary" leftAdornment={<Plus />}>
                New
              </Button>
            </Link>
          </MenuBarNavItem>

          {viewer ? (
            <MenuBarNavItem>
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
            </MenuBarNavItem>
          ) : (
            <MenuBarNavItem>
              <Link href="/login" passHref>
                <Button as="a">Login</Button>
              </Link>
            </MenuBarNavItem>
          )}
        </MenuBarNav>
      </MenuBar>
    </Header>
  )
}

export default DefaultMenuBar
