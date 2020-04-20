import { googleOauth2 } from '../../../lib/auth'
import absoluteUrl from '../../../lib/absolute-url'

export default async (req, res) => {
  const { origin } = absoluteUrl(req)
  const authorizationUri = googleOauth2.authorizationCode.authorizeURL({
    redirect_uri: `${origin}/api/auth/google/callback`,
    scope: 'profile email',
  })
  res.writeHead(302, { Location: authorizationUri })
  res.end()
}
