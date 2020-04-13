import { query as q } from 'faunadb'
import { serverClient } from '../../../lib/fauna'

export default async (req, res) => {
  const { title, link, userId } = await req.body

  try {
    if (!title || !link) {
      throw new Error('Title and link must be provided.')
    }

    const data = await serverClient.query(
      q.Create(q.Collection('Tips'), {
        data: { title, link, userId, createdAt: Date.now() },
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
