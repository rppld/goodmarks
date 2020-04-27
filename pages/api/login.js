import { query as q } from 'faunadb'
import { serverClient, serializeFaunaCookie } from '../../lib/fauna'

export default async (req, res) => {
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
