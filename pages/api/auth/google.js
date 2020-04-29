import { parse } from 'url'
import fetch from 'isomorphic-unfetch'
import { query as q } from 'faunadb'
import { serverClient, serializeFaunaCookie } from '../../../lib/fauna'
import { googleOauth2 } from '../../../lib/auth'
import absoluteUrl from '../../../lib/absolute-url'

export default async (req, res) => {
  const { callback } = req.query
  const { origin } = absoluteUrl(req)
  const redirectUrl = `${origin}/api/auth/google?callback=true`

  // If this is `/api/auth/google`, redirect to the auth screen.
  if (typeof callback === 'undefined') {
    const authorizationUri = googleOauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUrl,
      scope: 'profile email',
    })
    res.writeHead(302, { Location: authorizationUri })
    return res.end()
  }

  // If we’re on `/api/auth/google?callback=true`, handle authentication.
  const { login_referrer: referrer = '/' } = req.cookies
  const { query } = parse(req.url, true)
  const options = {
    code: query.code,
    // Pass `redirect_uri` again here for Google to validate.
    redirect_uri: redirectUrl,
  }

  try {
    const { Create, Let, Collection, Var, Select, Login, Match, Index } = q
    const result = await googleOauth2.authorizationCode.getToken(options)
    const { token } = googleOauth2.accessToken.create(result)
    const { access_token: accessToken } = token
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }

    // Get user details.
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
    const response = await fetch(url, config)
    const { name, email, picture } = await response.json()

    let signupRes
    let loginRes

    try {
      signupRes = await serverClient.query(
        Let(
          {
            user: Create(Collection('Users'), {
              data: {
                name,
                picture,
              },
            }),
            account: Select(
              ['ref'],
              Create(Collection('Accounts'), {
                credentials: { password: '' },
                data: {
                  email,
                  user: Select(['ref'], Var('user')),
                },
              })
            ),
          },
          { user: Var('user'), account: Var('account') }
        )
      )

      if (!signupRes.account) {
        throw new Error('No ref present in create query response.')
      }

      loginRes = await serverClient.query(
        Login(signupRes.account, { password: '' })
      )
    } catch (error) {
      // The `Create()` call will error when a user already exists,
      // so if we end up in here we can log the user in.
      loginRes = await serverClient.query(
        Login(Match(Index('accounts_by_email'), email), {
          password: '',
        })
      )
    }

    if (!loginRes.secret) {
      throw new Error('No secret present in login query response.')
    }

    const serializedCookie = serializeFaunaCookie(loginRes.secret)
    res.setHeader('Set-Cookie', serializedCookie)
    res.writeHead(302, { Location: referrer })
    res.end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}
