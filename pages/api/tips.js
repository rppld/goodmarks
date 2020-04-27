import { query as q } from 'faunadb'
import { serverClient } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'

async function getIndividualTip(tipId) {
  const { Get, Let, Paginate, Match, Index, Ref, Lambda, Collection, Var } = q
  const res = await serverClient.query(
    Let(
      {
        tipRef: Ref(Collection('Tips'), tipId),
        tip: Get(Var('tipRef')),
        comments: q.Map(
          Paginate(Match(Index('comments_by_entity'), Var('tipRef'))),
          Lambda('nextRef', Get(Var('nextRef')))
        ),
      },
      { tip: Var('tip'), comments: Var('comments') }
    )
  )
  return {
    tips: [
      {
        ...flattenDataKeys(res.tip),
        comments: flattenDataKeys(res.comments),
      },
    ],
  }
}

async function getTipsByUser(userId) {
  const res = await serverClient.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('tips_by_author'), q.Ref(q.Collection('Users'), userId))
      ),
      q.Lambda('nextRef', q.Get(q.Var('nextRef')))
    )
  )
  return {
    tips: res.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  }
}

async function getAllTips() {
  const res = await serverClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index('all_tips'))),
      q.Lambda('nextRef', q.Get(q.Var('nextRef')))
    )
  )
  return {
    tips: res.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  }
}

export default async (req, res) => {
  const { id, user_id: userId } = req.query

  if (id) {
    return res.status(200).json(await getIndividualTip(id))
  } else if (userId) {
    return res.status(200).json(await getTipsByUser(userId))
  } else {
    return res.status(200).json(await getAllTips())
  }
}
