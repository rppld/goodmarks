import cookie from 'cookie'
import Router from 'next/router'
import { profileApi } from 'pages/api/me'
import { FAUNA_SECRET_COOKIE } from './fauna'

async function getViewerOrRedirect(ctx) {
  if (typeof window === 'undefined') {
    const { req, res } = ctx
    const cookies = cookie.parse(req.headers.cookie ?? '')
    const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

    if (!faunaSecret) {
      res.writeHead(302, { Location: '/login' })
      res.end()
      return {}
    }

    const { viewer } = await profileApi(faunaSecret)
    return viewer
  }

  const response = await fetch('/api/me')

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const { viewer } = await response.json()

  if (viewer === null) {
    Router.push('/login')
  }

  return viewer
}

export default getViewerOrRedirect
