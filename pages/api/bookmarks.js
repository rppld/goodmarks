import { query as q } from 'faunadb'
import { serverClient } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'

const { Get, Let, Paginate, Match, Index, Ref, Lambda, Collection, Var } = q

async function getIndividualBookmark(bookmarkId) {
  const res = await serverClient.query(
    Let(
      {
        bookmarkRef: Ref(Collection('Bookmarks'), bookmarkId),
        bookmark: Get(Var('bookmarkRef')),
        comments: q.Map(
          Paginate(Match(Index('comments_by_entity'), Var('bookmarkRef'))),
          Lambda('nextRef', Get(Var('nextRef')))
        ),
      },
      { bookmark: Var('bookmark'), comments: Var('comments') }
    )
  )
  return {
    bookmarks: [
      {
        ...flattenDataKeys(res.bookmark),
        comments: flattenDataKeys(res.comments),
      },
    ],
  }
}

async function getBookmarksByUser(userId) {
  const res = await serverClient.query(
    q.Map(
      Paginate(
        Match(Index('bookmarks_by_author'), Ref(Collection('Users'), userId))
      ),
      Lambda('nextRef', Get(Var('nextRef')))
    )
  )
  return {
    bookmarks: res.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  }
}

async function getAllBookmarks() {
  const res = await serverClient.query(
    q.Map(
      Paginate(Match(Index('all_bookmarks'))),
      Lambda('nextRef', Get(Var('nextRef')))
    )
  )
  return {
    bookmarks: res.data.map(({ data, ref }) => ({
      ...data,
      id: ref.id,
    })),
  }
}

export default async (req, res) => {
  const { id, user_id: userId } = req.query

  if (id) {
    return res.status(200).json(await getIndividualBookmark(id))
  } else if (userId) {
    return res.status(200).json(await getBookmarksByUser(userId))
  }

  return res.status(200).json(await getAllBookmarks())
}
