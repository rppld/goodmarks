import React from 'react'
import Layout from '../../components/layout'
import { useRouter } from 'next/router'
import { withAuthSync } from '../../lib/auth'
import profileOrRedirect from '../../lib/profile-or-redirect'
import NewMovieForm from '../../components/new-movie-form'
import NewTVShowForm from '../../components/new-tv-show-form'
import NewLinkForm from '../../components/new-link-form'
import Link from 'next/link'
import Button from '../../components/button'
import { Header, HeaderNav, HeaderNavItem } from '../../components/header'
import { ChevronLeft } from '../../components/icon'

function getCategoryUI(handle) {
  switch (handle) {
    case 'movie':
      return <NewMovieForm />
    case 'tv-show':
      return <NewTVShowForm />
    case 'link':
      return <NewLinkForm />
    default:
      return <NewLinkForm />
  }
}

const Category = () => {
  const router = useRouter()
  const { category } = router.query || {}
  return (
    <Layout
      header={
        <Header>
          <HeaderNav>
            <HeaderNavItem>
              <Link href="/new" passHref>
                <Button as="a" leftAdornment={<ChevronLeft />}>
                  New bookmark
                </Button>
              </Link>
            </HeaderNavItem>
          </HeaderNav>
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
      {getCategoryUI(category)}
    </Layout>
  )
}

Category.getInitialProps = async (ctx) => {
  const viewer = await profileOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(Category)
