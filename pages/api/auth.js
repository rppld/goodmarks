import { query as q } from 'faunadb'
import cookie from 'cookie'
import { parse } from 'url'
import absoluteUrl from '../../lib/absolute-url'
import { googleOauth2 } from '../../lib/auth'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  serializeFaunaCookie,
} from '../../lib/fauna'

export default async (...args) => {
  const { action } = args[0].query // args[0] is the `req` object

  switch (action) {
    case 'login':
      return handleLogin(...args)
    case 'signup':
      return handleSignup(...args)
    case 'oauth2':
      return handleOauth2(...args)
    case 'logout':
    default:
      return handleLogout(...args)
  }
}

async function handleOauth2(req, res) {
  const { callback } = req.query
  const { origin } = absoluteUrl(req)
  const redirectUrl = `${origin}/api/auth?action=oauth2&provider=google&callback=true`

  // If this is `/api/auth?action=oauth2&provider=google`, redirect to
  // the auth screen.
  if (typeof callback === 'undefined') {
    const authorizationUri = googleOauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUrl,
      scope: 'profile email',
    })
    res.writeHead(302, { Location: authorizationUri })
    return res.end()
  }

  // If we’re on the callback URL, handle authentication.
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

async function handleSignup(req, res) {
  const { Create, Let, Collection, Var, Select } = q
  const { username, email, password } = await req.body

  try {
    if (!email || !password) {
      throw new Error('Email and password must be provided.')
    }
    console.log(`email: ${email} trying to create user.`)

    let signupRes

    try {
      signupRes = await serverClient.query(
        Let(
          {
            user: Create(Collection('Users'), {
              data: {
                username,
              },
            }),
            account: Select(
              ['ref'],
              Create(Collection('Accounts'), {
                credentials: { password },
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
    } catch (error) {
      console.error('Fauna create user error:', error)
      throw new Error('User already exists.')
    }

    if (!signupRes.account) {
      throw new Error('No ref present in create query response.')
    }

    const loginRes = await serverClient.query(
      q.Login(signupRes.account, {
        password,
      })
    )

    if (!loginRes.secret) {
      throw new Error('No secret present in login query response.')
    }

    const serializedCookie = serializeFaunaCookie(loginRes.secret)
    res.setHeader('Set-Cookie', serializedCookie)
    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function handleLogin(req, res) {
  const { Let, Get, Select, Var, Login, Match, Index } = q
  const { email, password } = await req.body

  try {
    if (!email || !password) {
      throw new Error('Email and password must be provided.')
    }

    const loginRes = await serverClient.query(
      Let(
        {
          // Login will return a token if the password matches the
          // credentials that were provided on register.
          res: Login(Match(Index('accounts_by_email'), email), {
            password,
          }),
          // We will return both the token as some account/user
          // information.
          account: Get(Select(['instance'], Var('res'))),
          user: Get(Select(['data', 'user'], Var('account'))),
          secret: Select(['secret'], Var('res')),
        },
        { account: Var('account'), user: Var('user'), secret: Var('secret') }
      )
    )

    if (!loginRes.secret) {
      throw new Error('No secret present in login query response.')
    }

    const serializedCookie = serializeFaunaCookie(loginRes.secret)
    res.setHeader('Set-Cookie', serializedCookie)
    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function handleLogout(req, res) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  if (!faunaSecret) {
    // Already logged out.
    return res.status(200).end()
  }
  // Invalidate secret (ie. logout from Fauna).
  await faunaClient(faunaSecret).query(q.Logout(false))
  // Clear cookie.
  const serializedCookie = cookie.serialize(FAUNA_SECRET_COOKIE, '', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    httpOnly: true,
    path: '/',
  })
  res.setHeader('Set-Cookie', serializedCookie)
  res.status(200).end()
}