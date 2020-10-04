import { query as q } from 'faunadb'
import {
  serverClient,
  faunaClient,
  FAUNA_SECRET_COOKIE,
  flattenDataKeys,
  CreateHashtags,
  TransformListsData,
} from 'lib/fauna'
import { User, List } from 'lib/types'
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

const {
  Foreach,
  Map,
  Create,
  HasIdentity,
  Ref,
  Update,
  Collection,
  Select,
  Get,
  Identity,
  Now,
  Paginate,
  Let,
  Do,
  Lambda,
  Var,
  Match,
  Index,
  If,
  Delete,
  Equals,
  Abort,
  Count,
  GT,
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
    return addObjectToList(req, res)
  }

  if (action === 'remove-item') {
    return removeObjectFromList(req, res)
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

async function removeObjectFromList(req, res) {
  const { objectId, listId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!objectId) throw new Error('An object ID must be provided.')
    if (!listId) throw new Error('A list ID must be provided.')

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          listRef: Ref(Collection('lists'), listId),
          list: Get(Var('listRef')),
          objectRef: Ref(Collection('bookmarks'), objectId),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          authorRef: Select(['data', 'author'], Var('list')),
          listItemsByListAndObject: Match(
            Index('list_items_by_list_and_object'),
            Var('listRef'),
            Var('objectRef')
          ),
        },
        If(
          // Check if user is allowed to update this list.
          Equals(Var('viewerRef'), Var('authorRef')),
          Foreach(
            Paginate(Var('listItemsByListAndObject')),
            Lambda(['created', 'object', 'itemRef'], Delete(Var('itemRef')))
          ),
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

async function addObjectToList(req, res) {
  const { itemId, listId } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!itemId) throw new Error('An item ID must be provided.')
    if (!listId) throw new Error('A list ID must be provided.')

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          itemRef: Ref(Collection('bookmarks'), itemId),
          listRef: Ref(Collection('lists'), listId),
          list: Get(Var('listRef')),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          listAuthorRef: Select(['data', 'author'], Var('list')),
          listItemsByListAndObject: Match(
            Index('list_items_by_list_and_object'),
            Var('listRef'),
            Var('itemRef')
          ),
          isAlreadyInList: GT(Count(Var('listItemsByListAndObject')), 0),
        },
        If(
          // Check if user is allowed to update this list.
          Equals(Var('viewerRef'), Var('listAuthorRef')),
          If(
            // Check if item is lready in list
            Var('isAlreadyInList'),
            Abort('Item is already in list'),
            Create(Collection('list_items'), {
              data: {
                list: Var('listRef'),
                object: Var('itemRef'),
                user: Var('listAuthorRef'),
                created: Now(),
              },
            })
          ),
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
          listRef: Ref(Collection('lists'), listId),
          list: Get(Var('listRef')),
          viewerRef: Select(['data', 'user'], Get(Identity())),
          authorRef: Select(['data', 'author'], Var('list')),
          hashtagRefs: await CreateHashtags(hashtags),
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
  const { name, description, private: isPrivate, hashtags } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!name) {
      throw new Error('A name must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          hashtagRefs: await CreateHashtags(hashtags),
          author: Select(['data', 'user'], Get(Identity())),
        },
        Create(Collection('lists'), {
          data: {
            name,
            description,
            private: isPrivate,
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
          listRef: Ref(Collection('lists'), id),
          list: Get(Var('listRef')),
          author: Select(['data', 'author'], Var('list')),
        },
        If(
          // Check if user is allowed to delete this list.
          Equals(Var('viewer'), Var('author')),
          // @todo: Once comments are implemented, remove all the
          // comments on the list here.
          Do(
            // Remove all stats related to the list.
            Foreach(
              Paginate(Match(Index('list_stats_by_list'), Var('listRef')), {
                size: 100000,
              }),
              Lambda(['listStatsRef'], Delete(Var('listStatsRef')))
            ),
            // Remove all list-items associated with the list
            Foreach(
              Paginate(Match(Index('list_items_by_list'), Var('listRef')), {
                size: 100000,
              }),
              Lambda(
                ['created', 'object', 'listItemRef'],
                Delete(Var('listItemRef'))
              )
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
        edges: TransformListsData(
          Map(
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

interface ListEdge {
  author: {
    data: Omit<User, 'id'>
  }
  original: boolean
  list: {
    data: Omit<List, 'id' | 'ts'>
  }
  listStats: any
}

interface ListResponse {
  edges: {
    data: ListEdge[]
  }
  isPrivate: boolean
  viewerIsAuthor: boolean
}

export const listApi = async (listId: string, faunaSecret?: string) => {
  const client = faunaSecret ? faunaClient(faunaSecret) : serverClient

  const data: ListResponse = await client.query(
    Let(
      {
        listRef: Ref(Collection('lists'), listId),
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
            TransformListsData(
              Map(
                Paginate(Match(Index('lists_by_reference'), Var('listRef'))),
                Lambda(['nextRef', 'title', 'author'], Var('nextRef'))
              )
            ),
            []
          ),
          TransformListsData(
            Map(
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
