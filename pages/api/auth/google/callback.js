import fetch from 'isomorphic-unfetch'
import { parse } from 'url'
import { query as q } from 'faunadb'
import { serverClient, serializeFaunaCookie } from '../../../../lib/fauna'
import { googleOauth2 } from '../../../../lib/auth'
import absoluteUrl from '../../../../lib/absolute-url'

export default async (req, res) => {
  const { login_referrer: referrer = '/' } = req.cookies
  const { query } = parse(req.url, true)
  const { origin } = absoluteUrl(req)
  const options = {
    code: query.code,
    // Pass `redirect_uri` again here for Google to validate.
    redirect_uri: `${origin}/api/auth/google/callback`,
  }

  try {
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
    const { name: fullName, email, picture } = await response.json()

    const userInfo = {
      email,
      fullName,
      picture,
    }

    let user
    let loginRes

    try {
      user = await serverClient.query(
        q.Create(q.Collection('Users'), {
          credentials: { password: '' },
          data: { ...userInfo },
        })
      )

      if (!user.ref) {
        throw new Error('No ref present in create query response.')
      }

      loginRes = await serverClient.query(q.Login(user.ref, { password: '' }))
    } catch (error) {
      // The `q.Create()` call will error when a user already exists,
      // so if we end up in here we can log the user in.
      loginRes = await serverClient.query(
        q.Login(q.Match(q.Index('users_by_email'), email), {
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
