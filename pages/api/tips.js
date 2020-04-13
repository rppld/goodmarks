import { query as q } from 'faunadb'
import { serverClient } from '../../lib/fauna'

export default async (req, res) => {
  const { id, user_id: userId } = req.query
  const tips = await serverClient.query(
    id
      ? q.Get(q.Ref(q.Collection('Tips'), id))
      : q.Map(
          userId
            ? q.Paginate(q.Match(q.Index('tips_by_user_id'), userId))
            : q.Paginate(q.Match(q.Index('all_tips'))),
          q.Lambda('nextRef', q.Get(q.Var('nextRef')))
        )
  )

  res.status(200).json({
    tips: id
      ? [tips.data]
      : tips.data.map(({ data, ref }) => ({
          ...data,
          id: ref.id,
        })),
  })
}
