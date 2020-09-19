import { query as q } from 'faunadb'
import cookie from 'cookie'
import { parse } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import absoluteUrl from 'utils/absolute-url'
import { googleOauth2 } from 'lib/auth'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  serializeFaunaCookie,
  CreatePasswordResetToken,
  InvalidateResetTokens,
} from 'lib/fauna'
import { sendPasswordResetEmail } from 'lib/ses'

const {
  Create,
  Let,
  Collection,
  Var,
  Select,
  Login,
  Match,
  Index,
  Get,
  If,
  Paginate,
  Exists,
  Identity,
  Update,
} = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { action } = req.query

  switch (action) {
    case 'login':
      return handleLogin(req, res)
    case 'signup':
      return handleSignup(req, res)
    case 'oauth2':
      return handleOauth2(req, res)
    case 'request-password-reset':
      return handleRequestPasswordReset(req, res)
    case 'change-password':
      return handleChangePassword(req, res)
    case 'logout':
    default:
      return handleLogout(req, res)
  }
}

function RequestPasswordReset(email) {
  return If(
    Exists(Match(Index('accounts_by_email'), email)),
    Let(
      {
        accountRef: Select(
          [0],
          Paginate(Match(Index('accounts_by_email'), email))
        ),
        invalidate: InvalidateResetTokens(Var('accountRef')),
        token: CreatePasswordResetToken(Var('accountRef')),
      },
      Var('token')
    ),
    false
  )
}

async function handleRequestPasswordReset(req, res) {
  const { email } = await req.body
  const { origin } = absoluteUrl(req)

  try {
    if (!email) {
      throw new Error('Email must be provided.')
    }

    try {
      const faunaRes: any = await serverClient.query(
        RequestPasswordReset(email)
      )

      const redirectUrl = `${origin}/reset-password?token=${faunaRes.secret}`
      sendPasswordResetEmail(email, redirectUrl)

      console.log(res)
    } catch (error) {
      console.log(error)
    }

    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}

function ChangePassword(password) {
  // The token that is used to change the password belongs to a
  // document from the Collection('accounts_password_reset_request'),
  // therefore the Identity() reference will point to such a doc. When
  // we created the document we saved the account to it.
  return Let(
    {
      resetRequest: Get(Identity()),
      accountRef: Select(['data', 'account'], Var('resetRequest')),
    },
    Update(Var('accountRef'), { credentials: { password: password } })
  )
}

async function handleChangePassword(req, res) {
  const { password, token } = await req.body
  const { origin } = absoluteUrl(req)
  const redirectUrl = `${origin}/login`
  // we will use the token here which is the password reset token. the
  // only thing it can do is reset a password (we defined that in the
  // FaunaDB roles)
  const client = faunaClient(token)

  try {
    await client.query(ChangePassword(password))
    res.writeHead(302, { Location: redirectUrl })
    res.end()
  } catch (error) {
    console.error(error)
    // return res.json({ error: 'could not reset password' })
    res.status(400).send(error.message)
  }
}

async function handleSignup(req, res) {
  const { username, email, password } = await req.body

  try {
    if (!username || !email || !password) {
      throw new Error('Username, email and password must be provided.')
    }
    console.log(`email: ${email} trying to create user.`)

    let signupRes

    try {
      signupRes = await serverClient.query(
        Let(
          {
            user: Create(Collection('Users'), {
              data: {
                handle: username,
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

    // @todo: Type `data`
    const data: any = await serverClient.query(
      Login(signupRes.account, {
        password,
      })
    )
    const { secret } = data

    if (!secret) {
      throw new Error('No secret present in login query response.')
    }

    const serializedCookie = serializeFaunaCookie(secret)
    res.setHeader('Set-Cookie', serializedCookie)
    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function handleLogin(req, res) {
  const { email, password } = await req.body

  try {
    if (!email || !password) {
      throw new Error('Email and password must be provided.')
    }

    // @todo: Type `data`
    const data: any = await serverClient.query(
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
    const { secret } = data

    if (!secret) {
      throw new Error('No secret present in login query response.')
    }

    const serializedCookie = serializeFaunaCookie(secret)
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
                firstName: name,
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
