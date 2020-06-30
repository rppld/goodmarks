import { query as q } from 'faunadb'
import cookie from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import { faunaClient, FAUNA_SECRET_COOKIE } from 'lib/fauna'

const { Identity, Select, Get, Let, Var } = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(200).json({ viewer: null })
  }

  res.status(200).json(await profileApi(faunaSecret))
}

export const profileApi = async (faunaSecret) => {
  const { user, email }: any = await faunaClient(faunaSecret).query(
    Let(
      {
        user: Get(Select(['data', 'user'], Get(Identity()))),
        email: Select(['data', 'email'], Get(Identity())),
      },
      {
        user: Var('user'),
        email: Var('email'),
      }
    )
  )
  const viewer = {
    id: user.ref.id,
    email,
    ...user.data,
  }
  return {
    viewer,
  }
}
