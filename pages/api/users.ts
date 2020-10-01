import { query as q } from 'faunadb'
import cookie from 'cookie'
import { deleteObject } from 'lib/s3'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  faunaClient,
  serverClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
} from 'lib/fauna'
import { User } from 'lib/types'

const {
  Let,
  Count,
  GT,
  Ref,
  Create,
  Paginate,
  Collection,
  Var,
  HasIdentity,
  If,
  Match,
  Index,
  Select,
  Get,
  Identity,
  Update,
  Delete,
  Exists,
  Union,
} = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { action } = req.query

  switch (action) {
    case 'follow':
      return handleFollow(req, res)
    case 'update':
      return handleUpdate(req, res)
    default:
      return get(req, res)
  }
}

async function get(req, res) {
  const { handle } = req.query
  const lowerCaseHandle = handle.toLowerCase()
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data = await client.query(
    Let(
      {
        setRef: Match(Index('users_by_normalized_handle'), lowerCaseHandle),
        userRef: If(
          Exists(Var('setRef')),
          Select(0, Paginate(Var('setRef'), { size: 10 })),
          false
        ),
        user: If(Exists(Var('userRef')), Get(Var('userRef')), false),
      },
      Var('user')
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

interface UpdateUserResponse {
  oldUser: {
    data: User
  }
  newUser: {
    data: User
  }
}

async function handleUpdate(req, res) {
  const { userId, payload } = req.body

  const data: UpdateUserResponse = await serverClient.query(
    Let(
      {
        userRef: Ref(Collection('users'), userId),
        user: Get(Var('userRef')),
        updateUser: Update(Var('userRef'), {
          data: {
            ...payload,
          },
        }),
      },
      {
        oldUser: Var('user'),
        newUser: Var('updateUser'),
      }
    )
  )
  const { oldUser, newUser } = data

  // Delete old picture from S3 if updates contained a new one.
  if (oldUser.data.picture !== newUser.data.picture) {
    deleteObject(oldUser.data.picture)
  }

  res.status(200).json(flattenDataKeys(newUser))
}

async function handleFollow(req, res) {
  const { authorId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  const data = await faunaClient(faunaSecret).query(
    Let(
      {
        followerStatsMatch: If(
          HasIdentity(),
          Match(
            Index('follower_stats_by_author_and_follower'),
            Ref(Collection('users'), authorId),
            Select(['data', 'user'], Get(Identity()))
          ),
          false
        ),
        action: If(
          // Check if there’s an existing connection between the two
          // users, which would mean the follower already follows the
          // author.
          Exists(Var('followerStatsMatch')),
          // If there’s a connection, get the ref of the match and
          // delete it to unfollow the author.
          Delete(Select('ref', Get(Var('followerStatsMatch')), null)),
          // If not, create a connection to follow the author.
          Create(Collection('follower_stats'), {
            data: {
              postLikes: 0,
              postReposts: 0,
              author: Ref(Collection('users'), authorId),
              follower: Select(['data', 'user'], Get(Identity())),
            },
          })
        ),
      },
      Var('action')
    )
  )

  res.status(200).json(flattenDataKeys(data))
}
