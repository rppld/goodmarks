import { query as q } from 'faunadb'
import { faunaClient } from '../../../lib/fauna'

export default async function createTip(faunaSecret, input) {
  const { title, url } = input
  const { Create, Collection, Select, Get, Identity, Now } = q

  try {
    if (!title || !url) {
      throw new Error('Title and link must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Tips'), {
        data: {
          ...input,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
        },
      })
    )

    return {
      ...data.data,
      id: data.ref.id,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}
