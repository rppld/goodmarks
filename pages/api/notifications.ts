import { query as q } from 'faunadb'
import cookie from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  serialize,
  parseValue,
  transformNotificationsResponse,
} from 'lib/fauna'

const {
  Identity,
  Select,
  Get,
  Let,
  Var,
  Paginate,
  Match,
  Index,
  Lambda,
  If,
  Equals,
} = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { read, first, after: cursor = 'null' } = req.query
  const size = parseInt(first as string) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(401).send('Unauthorized')
  }

  // Query for all notifications.
  let match = Match(Index('notifications_by_recipient'), Var('currentUserRef'))

  // If `read` is defined, query for either unread or read
  // notifications.
  if (typeof read !== 'undefined') {
    match = Match(
      Index('notifications_by_recipient_and_read_status'),
      Var('currentUserRef'),
      If(Equals(read, 'true'), true, false)
    )
  }

  const data: any = await faunaClient(faunaSecret).query(
    Let(
      {
        account: Get(Identity()),
        currentUserRef: Select(['data', 'user'], Var('account')),
        notifications: transformNotificationsResponse(
          q.Map(
            Paginate(match, {
              size,
              after: cursor === 'null' ? undefined : parseValue(cursor),
            }),
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
      },
      {
        notifications: Var('notifications'),
      }
    )
  )
  const { notifications } = data
  const { before, after, ...edges } = notifications

  return res.status(200).json({
    edges: flattenDataKeys(edges),
    pageInfo: {
      hasNextPage: Boolean(after),
      endCursor: Boolean(after) ? serialize(after) : null,
    },
  })
}
