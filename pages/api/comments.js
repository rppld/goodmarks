import { query as q } from 'faunadb'
import cookie from 'cookie'
import { faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'

export default async (...args) => {
  const { action } = args[0].query

  if (action === 'create') {
    return createComment(...args)
  }
}

async function createComment(req, res) {
  const { Create, Ref, Collection, Select, Get, Identity, Now } = q
  const { text, entity } = await req.body
  const collection = entity.type === 'COLLECTION' ? 'Collections' : 'Bookmarks'
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!text) {
      throw new Error('Text must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Comments'), {
        data: {
          text,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
          entity: Ref(Collection(collection), entity.id),
        },
      })
    )

    res.status(200).json({
      ...data.data,
      id: data.ref.id,
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
}
