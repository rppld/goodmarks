import { query as q } from 'faunadb'
import { serverClient, faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import cookie from 'cookie'

export default async (...args) => {
  const { id, user, action } = args[0].query

  if (action === 'create') {
    return createBookmark(...args)
  }

  if (id) {
    return getBookmarkById(...args)
  }

  if (user) {
    return getBookmarksByUser(...args)
  }

  return getAllBookmarks(...args)
}

async function createBookmark(req, res) {
  const { title, description, details, category } = req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const {
    Create,
    Select,
    Paginate,
    Identity,
    Now,
    Get,
    Collection,
    Match,
    Index,
  } = q

  try {
    if (!title) {
      throw new Error('Title and link must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Bookmarks'), {
        data: {
          title,
          description,
          category: Select(
            0,
            Paginate(Match(Index('categories_by_slug'), category))
          ),
          details,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
        },
      })
    )

    return res.status(200).json({
      ...data.data,
      id: data.ref.id,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function getBookmarkById(req, res) {
  const { id } = req.query
  const { Get, Let, Paginate, Match, Index, Ref, Lambda, Collection, Var } = q

  const data = await serverClient.query(
    Let(
      {
        bookmarkRef: Ref(Collection('Bookmarks'), id),
        bookmark: Get(Var('bookmarkRef')),
        comments: q.Map(
          Paginate(Match(Index('comments_by_entity'), Var('bookmarkRef'))),
          Lambda('nextRef', Get(Var('nextRef')))
        ),
      },
      { bookmark: Var('bookmark'), comments: Var('comments') }
    )
  )
  return res.status(200).json({
    bookmarks: [
      {
        ...flattenDataKeys(data.bookmark),
        comments: flattenDataKeys(data.comments),
      },
    ],
  })
}

async function getBookmarksByUser(req, res) {
  const { user: userId } = req.query
  const { Get, Paginate, Match, Index, Ref, Lambda, Collection, Var } = q

  const response = await serverClient.query(
    q.Map(
      Paginate(
        Match(Index('bookmarks_by_author'), Ref(Collection('Users'), userId))
      ),
      Lambda('nextRef', Get(Var('nextRef')))
    )
  )

  return res.status(200).json({
    bookmarks: response.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  })
}

async function getAllBookmarks(req, res) {
  const { Get, Paginate, Match, Index, Lambda, Var } = q

  const response = await serverClient.query(
    q.Map(
      Paginate(Match(Index('all_bookmarks'))),
      Lambda('nextRef', Get(Var('nextRef')))
    )
  )

  return res.status(200).json({
    bookmarks: response.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  })
}
