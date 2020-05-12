import { query as q } from 'faunadb'
import cookie from 'cookie'
import { faunaClient, FAUNA_SECRET_COOKIE } from 'lib/fauna'
import { flattenDataKeys } from 'lib/fauna/utils'

const {
  Let,
  Ref,
  Create,
  Collection,
  Var,
  HasIdentity,
  If,
  Match,
  Index,
  Select,
  Get,
  Identity,
  Delete,
  Exists,
} = q

export default async (req, res) => {
  const { authorId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  const data = await faunaClient(faunaSecret).query(
    Let(
      {
        followerStatsMatch: If(
          HasIdentity(),
          Match(
            Index('followerstats_by_author_and_follower'),
            Ref(Collection('Users'), authorId),
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
          Create(Collection('FollowerStats'), {
            data: {
              postLikes: 0,
              postReposts: 0,
              author: Ref(Collection('Users'), authorId),
              follower: Select(['data', 'user'], Get(Identity())),
            },
          })
        ),
      },
      Var('action')
    )
  )

  // const unfollow = Let(
  //   {
  //     followerStatsMatch: If(
  //       HasIdentity(),
  //       Match(
  //         Index('followerstats_by_author_and_follower'),
  //         Ref(Collection('Users'), authorId),
  //         Select(['data', 'user'], Get(Identity()))
  //       ),
  //       false
  //     ),
  //     followerStatsRef: Select('ref', Get(Var('followerStatsMatch'))),
  //     unfollow: Delete(Var('followerStatsRef')),
  //   },
  //   Var('unfollow')
  // )

  // const follow = Create(Collection('FollowerStats'), {
  //   data: {
  //     postLikes: 0,
  //     postReposts: 0,
  //     author: Ref(Collection('Users'), authorId),
  //     follower: Select(['data', 'user'], Get(Identity())),
  //   },
  // })

  // const data = await faunaClient(faunaSecret).query(
  //   action === 'follow' ? follow : unfollow
  // )

  res.status(200).json(flattenDataKeys(data))
}
