import { query as q } from 'faunadb'
import cookie from 'cookie'
import { faunaClient, FAUNA_SECRET_COOKIE } from '../../../lib/fauna'

export default async (req, res) => {
  const { Create, Collection, Select, Get, Identity, Now } = q
  const { title, description, url } = await req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!title || !url) {
      throw new Error('Title and link must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Bookmarks'), {
        data: {
          title,
          description,
          url,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
        },
      })
    )

    res.status(200).json({
      ...data.data,
      id: data.ref.id,
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
}
