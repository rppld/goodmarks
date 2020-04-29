import { query as q } from 'faunadb'
import cookie from 'cookie'
import { faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'

export default async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(200).json({ viewer: null })
  }

  res.status(200).json(await getViewer(faunaSecret))
}

export const getViewer = async (faunaSecret) => {
  const { Identity, Select, Get } = q
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
