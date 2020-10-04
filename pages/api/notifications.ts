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
  Map,
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
  Update,
  Ref,
  Collection,
} = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { read, first, after: cursor = 'null', action } = req.query
  const size = parseInt(first as string) || 10
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(401).send('Unauthorized')
  }

  const allNotifications = Match(
    Index('notifications_by_recipient'),
    Var('currentUserRef')
  )
  const notificationsByReadStatus = Match(
    Index('notifications_by_recipient_and_read_status'),
    Var('currentUserRef'),
    If(Equals(read, 'true'), true, false)
  )

  let match = allNotifications

  // If `read` is defined, match for either unread or read
  // notifications.
  if (typeof read !== 'undefined') {
    match = notificationsByReadStatus
  }

  if (action === 'mark_as_read') {
    // Mark all unread notifications as read
    await faunaClient(faunaSecret).query(
      Let(
        {
          account: Get(Identity()),
          currentUserRef: Select(['data', 'user'], Var('account')),
        },
        Map(
          Paginate(notificationsByReadStatus, {
            size: 10000,
          }),
          Lambda(
            ['createdTime', 'ref'],
            Update(Var('ref'), {
              data: {
                read: true,
              },
            })
          )
        )
      )
    )

    return res.status(200).send('Notifications marked as read.')
  }

  const data: any = await faunaClient(faunaSecret).query(
    Let(
      {
        account: Get(Identity()),
        currentUserRef: Select(['data', 'user'], Var('account')),
        notifications: transformNotificationsResponse(
          Map(
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
