import { query as q } from 'faunadb'
import cookie from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import { faunaClient, FAUNA_SECRET_COOKIE } from 'lib/fauna'

const { Identity, Select, Get, Let, Var, Match, Count, Index, If, GT } = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(200).json({ viewer: null })
  }

  res.status(200).json(await profileApi(faunaSecret))
}

export const profileApi = async (faunaSecret) => {
  const data: any = await faunaClient(faunaSecret).query(
    Let(
      {
        account: Get(Identity()),
        userRef: Select(['data', 'user'], Var('account')),
        user: Get(Var('userRef')),
        email: Select(['data', 'email'], Get(Identity())),
        unreadNotificationsCount: Count(
          Match(
            Index('notifications_by_recipient_and_read_status'),
            Var('userRef'),
            false
          )
        ),
        hasUnreadNotifications: If(
          GT(Var('unreadNotificationsCount'), 0),
          true,
          false
        ),
      },
      {
        user: Var('user'),
        email: Var('email'),
        hasUnreadNotifications: Var('hasUnreadNotifications'),
      }
    )
  )

  const { user, email, hasUnreadNotifications } = data
  const viewer = {
    id: user.ref.id,
    email,
    hasUnreadNotifications,
    ...user.data,
  }
  return {
    viewer,
  }
}
