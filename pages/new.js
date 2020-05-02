import React from 'react'
import cookie from 'cookie'
import Router from 'next/router'
import Link from 'next/link'
import { FAUNA_SECRET_COOKIE } from '../lib/fauna'
import { withAuthSync } from '../lib/auth'
import { Header, HeaderNav, HeaderNavItem } from '../components/header'
import Layout from '../components/layout'
import Button from '../components/button'
import PageTitle from '../components/page-title'
import { H2 } from '../components/heading'
import Text from '../components/text'
import { getViewer } from './api/me'

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

      <ul>
        <li>
          <Link href="/new/movie">
            <a>Movie</a>
          </Link>
        </li>
        <li>
          <Link href="/new/tv-show">
            <a>TV show</a>
          </Link>
        </li>
        <li>
          <Link href="/new/link">
            <a>Link</a>
          </Link>
        </li>
      </ul>
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  if (typeof window === 'undefined') {
    const { req, res } = ctx
    const cookies = cookie.parse(req.headers.cookie ?? '')
    const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

    if (!faunaSecret) {
      res.writeHead(302, { Location: '/login' })
      res.end()
      return {}
    }

    const { viewer } = await getViewer(faunaSecret)
    return { viewer }
  }

  const response = await fetch('/api/me')

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const { viewer } = await response.json()

  if (viewer === null) {
    Router.push('/login')
  }

  return { viewer }
}

export default withAuthSync(New)
