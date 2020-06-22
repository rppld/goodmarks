import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  createHashtags,
} from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

const {
  Create,
  HasIdentity,
  Ref,
  Join,
  Count,
  Update,
  Add,
  Not,
  Do,
  Subtract,
  Collection,
  Select,
  Get,
  Identity,
  Contains,
  Now,
  Union,
  Paginate,
  Let,
  Lambda,
  Var,
  Exists,
  Match,
  Index,
  If,
  Delete,
  Equals,
  Abort,
} = q

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, handle, action } = req.query

  if (action === 'create') {
    return createList(req, res)
  }

  if (action === 'delete') {
    return deleteList(req, res)
  }

  if (action === 'comment') {
    // return createComment(req, res)
  }

  if (action === 'delete-comment') {
    // return deleteComment(req, res)
  }

  if (action === 'like') {
    // return likeList(req, res)
  }

  if (id) {
    return getListsByReference(req, res)
  }

  if (handle) {
    return getListsByUserHandle(req, res)
  }
}

async function createList(req, res) {
  const { name, description, private: isPrivate, hashtags, items } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!name) {
      throw new Error('A name must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          hashtagRefs: await createHashtags(hashtags),
          author: Select(['data', 'user'], Get(Identity())),
        },
        Create(Collection('Lists'), {
          data: {
            name,
            description,
            private: isPrivate,
            items,
            likes: 0,
            comments: 0,
            reposts: 0,
            hashtags: Var('hashtagRefs'),
            author: Var('author'),
            created: Now(),
          },
        })
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function deleteList(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!id) {
      throw new Error('List ID must be provided.')
    }

    await faunaClient(faunaSecret).query(
      Let(
        {
          viewer: Select(['data', 'user'], Get(Identity())),
          listRef: Ref(Collection('Lists'), id),
          list: Get(Var('listRef')),
          author: Select(['data', 'author'], Var('list')),
        },
        q.If(
          // Check if user is allowed to delete this list.
          Equals(Var('viewer'), Var('author')),
          q.Do(
            // Remove all the comments on the list.
            q.Map(
              Paginate(
                Match(Index('comments_by_list_ordered'), Var('listRef')),
                {
                  size: 100000,
                }
              ),
              Lambda(['ts', 'commentRef'], Delete(Var('commentRef')))
            ),
            // Remove all stats related to the list.
            q.Map(
              Paginate(Match(Index('list_stats_by_list'), Var('listRef')), {
                size: 100000,
              }),
              Lambda(['listStatsRef'], Delete(Var('listStatsRef')))
            ),
            // Remove list itself.
            Delete(Var('listRef'))
          ),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).send('Comments and list successfully deleted.')
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function getListsByUserHandle(req, res) {
  const { handle } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data = await client.query(
    Let(
      {
        setRef: Match(Index('users_by_handle'), handle.toLowerCase()),
        authorRef: Select(0, Paginate(Var('setRef'), { size: 10 })),
        author: Get(Var('authorRef')),
        account: If(HasIdentity(), Get(Identity()), false),
        currentUserRef: If(
          HasIdentity(),
          Select(['data', 'user'], Var('account')),
          false
        ),
        viewerIsAuthor: Equals(Var('currentUserRef'), Var('authorRef')),
        match: If(
          Var('viewerIsAuthor'),
          // Return all lists if the viewer is the list-author.
          Match(Index('lists_by_author'), Var('authorRef')),
          // Otherwise only return the public ones.
          Match(Index('lists_by_author_and_private'), Var('authorRef'), false)
        ),
        edges: getListsWithUsersMapGetGeneric(
          q.Map(
            Paginate(Var('match')),
            // The index contains two values so our lambda also takes
            // two values.
            Lambda(['createdTime', 'ref'], Var('ref'))
          )
        ),
      },
      {
        edges: Var('edges'),
      }
    )
  )

  return res.status(200).json(flattenDataKeys(data))
}

function getListsWithUsersMapGetGeneric(listsSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    // For all lists this is just
    // Paginate(Documents(Collection('Lists'))), else it's a match
    // on an index.
    listsSetRefOrArray,
    Lambda((ref) =>
      Let(
        {
          list: Get(Var('ref')),
          // Get the original list
          original: If(
            Contains(['data', 'original'], Var('list')),
            // Reposted list. Get original list's data. We
            // want to get the original as well in the same structure,
            // let's just use recursion to construct that query, we
            // could get the whole repost chain like this, it looks a
            // bit like traversing a graph. We are only interested in
            // the first reposted list so we pas depth 1 as
            // default, depth is meant to make sure sure we don't loop
            // endelessly in javascript.
            depth > 0
              ? Select(
                  [0],
                  getListsWithUsersMapGetGeneric(
                    [Select(['data', 'original'], Var('list'))],
                    depth - 1
                  )
                )
              : false,
            // Normal list, there is no original.
            false
          ),
          // Get the user that wrote the list.
          user: Get(Select(['data', 'author'], Var('list'))),
          // Get the account via identity.
          account: If(HasIdentity(), Get(Identity()), false),
          // Get the user that is currently logged in.
          currentUserRef: If(
            HasIdentity(),
            Select(['data', 'user'], Var('account')),
            false
          ),
          // Get the statistics for the list
          listStatsMatch: Match(
            Index('list_stats_by_user_and_list'),
            Var('currentUserRef'),
            Select(['ref'], Var('list'))
          ),
          followerStatsMatch: Match(
            Index('follower_stats_by_author_and_follower'),
            Var('currentUserRef'),
            Select(['ref'], Var('list'))
          ),
          listStats: If(
            Exists(Var('listStatsMatch')),
            Get(Var('listStatsMatch')),
            {}
          ),
          // Get comments, index has two values so lambda has two values
          comments: q.Map(
            Paginate(Match(Index('comments_by_list_ordered'), Var('ref'))),
            Lambda(
              ['ts', 'commentRef'],
              Let(
                {
                  comment: Get(Var('commentRef')),
                  author: Get(Select(['data', 'author'], Var('comment'))),
                },
                {
                  comment: Var('comment'),
                  author: Var('author'),
                }
              )
            )
          ),
        },
        // Return our elements
        {
          user: Var('user'),
          original: Var('original'),
          list: Var('list'),
          listStats: Var('listStats'),
          comments: Var('comments'),
        }
      )
    )
  )
}

export const listApi = async (listId: string, faunaSecret?: string) => {
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient
  const { edges, isPrivate, viewerIsAuthor } = await client.query(
    Let(
      {
        listRef: Ref(Collection('Lists'), listId),
        isPrivate: Select(['data', 'private'], Get(Var('listRef'))),
        authorRef: Select(['data', 'author'], Get(Var('listRef'))),
        account: If(HasIdentity(), Get(Identity()), false),
        currentUserRef: If(
          HasIdentity(),
          Select(['data', 'user'], Var('account')),
          false
        ),
        viewerIsAuthor: Equals(Var('currentUserRef'), Var('authorRef')),
        edges: If(
          Var('isPrivate'),
          If(
            Var('viewerIsAuthor'),
            getListsWithUsersMapGetGeneric(
              q.Map(
                Paginate(Match(Index('lists_by_reference'), Var('listRef'))),
                Lambda(['nextRef', 'title', 'author'], Var('nextRef'))
              )
            ),
            []
          ),
          getListsWithUsersMapGetGeneric(
            q.Map(
              Paginate(Match(Index('lists_by_reference'), Var('listRef'))),
              Lambda(['nextRef', 'title', 'author'], Var('nextRef'))
            )
          )
        ),
      },
      {
        edges: Var('edges'),
        isPrivate: Var('isPrivate'),
        viewerIsAuthor: Var('viewerIsAuthor'),
      }
    )
  )

  if (isPrivate && !viewerIsAuthor) {
    throw new Error('Unauthorized: Private list')
  }

  // Bit awkward to first stringify the data and then parse it again
  // as JSON, but it could still contain FQL and this is the only way
  // I found to get rid of it.
  const json = JSON.stringify(flattenDataKeys({ edges }))
  return JSON.parse(json)
}

async function getListsByReference(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    const data = await listApi(id, faunaSecret)
    return res.status(200).send(data)
  } catch (error) {
    return res.status(401).send(error.message)
  }
}
