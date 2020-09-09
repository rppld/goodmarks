import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  createHashtags,
  getListsWithUsersMapGetGeneric,
} from 'lib/fauna'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

const {
  Filter,
  Create,
  Not,
  HasIdentity,
  Ref,
  Distinct,
  Append,
  Update,
  Collection,
  Select,
  Get,
  Identity,
  Now,
  Paginate,
  Let,
  Lambda,
  Var,
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

  if (action === 'update') {
    return updateList(req, res)
  }

  if (action === 'delete') {
    return deleteList(req, res)
  }

  if (action === 'add-item') {
    return addItemToList(req, res)
  }

  if (action === 'remove-item') {
    return removeItemFromList(req, res)
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

async function removeItemFromList(req, res) {
  const { objectId, listId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!objectId) throw new Error('An object ID must be provided.')
    if (!listId) throw new Error('A list ID must be provided.')

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          listRef: Ref(Collection('Lists'), listId),
          list: Get(Var('listRef')),
          objectRef: Ref(Collection('Bookmarks'), objectId),
          currentItems: Select(['data', 'items'], Var('list'), []),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          authorRef: Select(['data', 'author'], Var('list')),
        },
        If(
          // Check if user is allowed to update this list.
          Equals(Var('viewerRef'), Var('authorRef')),
          Update(Var('listRef'), {
            data: {
              items: Filter(
                Var('currentItems'),
                Lambda('i', Not(Equals(Var('i'), Var('objectRef'))))
              ),
            },
          }),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function addItemToList(req, res) {
  const { itemId, listId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!itemId) throw new Error('An item ID must be provided.')
    if (!listId) throw new Error('A list ID must be provided.')

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          itemRef: Ref(Collection('Bookmarks'), itemId),
          listRef: Ref(Collection('Lists'), listId),
          list: Get(Var('listRef')),
          currentItems: Select(['data', 'items'], Var('list'), []),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          authorRef: Select(['data', 'author'], Var('list')),
        },
        If(
          // Check if user is allowed to update this list.
          Equals(Var('viewerRef'), Var('authorRef')),
          Update(Var('listRef'), {
            data: {
              items: Distinct(Append(Var('currentItems'), [Var('itemRef')])),
            },
          }),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function updateList(req, res) {
  const { listId, name, description, private: isPrivate, hashtags } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!listId) throw new Error('A list ID must be provided.')

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          listRef: Ref(Collection('Lists'), listId),
          list: Get(Var('listRef')),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          authorRef: Select(['data', 'author'], Var('list')),
          hashtagRefs: await createHashtags(hashtags),
        },
        If(
          // Check if user is allowed to update this list.
          Equals(Var('viewerRef'), Var('authorRef')),
          Update(Var('listRef'), {
            data: {
              name,
              description,
              private: isPrivate,
              hashtags: Var('hashtagRefs'),
            },
          }),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
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
        setRef: Match(Index('users_by_handle'), handle),
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

export const listApi = async (listId: string, faunaSecret?: string) => {
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient
  // @todo: Type `data`
  const data: any = await client.query(
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
  const { edges, isPrivate, viewerIsAuthor } = data

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
