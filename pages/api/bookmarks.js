import { query as q } from 'faunadb'
import { serverClient, faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import cookie from 'cookie'

export default async (...args) => {
  const { id, user, action } = args[0].query

  if (action === 'create') {
    return createBookmark(...args)
  }

  if (action === 'delete') {
    return deleteBookmark(...args)
  }

  if (id) {
    return getBookmarkById(...args)
  }

  if (user) {
    return getBookmarksByUser(...args)
  }

  return getAllBookmarks(...args)
}

async function deleteBookmark(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]
  const {
    Delete,
    Lambda,
    Paginate,
    Collection,
    Match,
    Index,
    Var,
    Ref,
    Equals,
    Select,
    Get,
    Let,
    Identity,
    Abort,
  } = q

  try {
    if (!id) {
      throw new Error('Bookmark ID must be provided.')
    }

    await faunaClient(faunaSecret).query(
      Let(
        {
          viewer: Select(['data', 'user'], Get(Identity())),
          bookmarkRef: Ref(Collection('Bookmarks'), id),
          bookmark: Get(Var('bookmarkRef')),
          author: Select(['data', 'author'], Var('bookmark')),
        },
        q.If(
          // 1. Check if user is allowed to delete this bookmark.
          Equals(Var('viewer'), Var('author')),
          q.Do(
            // 2. Remove all the comments on the bookmark.
            q.Map(
              Paginate(Match(Index('comments_by_entity'), Var('bookmarkRef')), {
                size: 100000,
              }),
              Lambda('x', Delete(Var('x')))
            ),
            // 3. Remove bookmark itself.
            Delete(Var('bookmarkRef'))
          ),
          Abort('Not allowed')
        )
      )
    )

    return res.status(200).send('Comments and bookmark successfully deleted.')
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
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

    return res.status(200).json(flattenDataKeys(data))
  } catch (error) {
    console.log(error)
    return res.status(400).send(error.message)
  }
}

async function getBookmarkById(req, res) {
  const { id } = req.query
  const {
    Get,
    Let,
    Paginate,
    Match,
    Select,
    Index,
    Ref,
    Lambda,
    Collection,
    Var,
  } = q

  const data = await serverClient.query(
    Let(
      {
        bookmarkRef: Ref(Collection('Bookmarks'), id),
        bookmark: Get(Var('bookmarkRef')),
        author: Get(Select(['data', 'author'], Var('bookmark'))),
        comments: q.Map(
          Paginate(Match(Index('comments_by_entity'), Var('bookmarkRef'))),
          Lambda('nextRef', Get(Var('nextRef')))
        ),
      },
      {
        bookmark: Var('bookmark'),
        author: Var('author'),
        comments: Var('comments'),
      }
    )
  )
  return res.status(200).json({
    bookmarks: [
      {
        ...flattenDataKeys(data.bookmark),
        comments: flattenDataKeys(data.comments),
        author: flattenDataKeys(data.author),
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
    bookmarks: response.data.map(flattenDataKeys),
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
    bookmarks: response.data.map(flattenDataKeys),
  })
}
