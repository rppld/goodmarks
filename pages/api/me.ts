import { query as q } from 'faunadb'
import cookie from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import { faunaClient, FAUNA_SECRET_COOKIE } from 'lib/fauna'

const { Identity, Select, Get } = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(200).json({ viewer: null })
  }

  res.status(200).json(await profileApi(faunaSecret))
}

export const profileApi = async (faunaSecret) => {
  const { ref, data } = await faunaClient(faunaSecret).query(
    Get(Select(['data', 'user'], Get(Identity())))
  )
  const viewer = {
    id: ref.id,
    ...data,
  }
  return {
    viewer,
  }
}
