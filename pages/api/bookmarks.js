import { query as q } from 'faunadb'
import { serverClient, faunaClient, FAUNA_SECRET_COOKIE } from '../../lib/fauna'
import { flattenDataKeys } from '../../lib/fauna/utils'
import cookie from 'cookie'

const {
  Create,
  Ref,
  Collection,
  Select,
  Get,
  Identity,
  Now,
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

export default async (...args) => {
  const { id, action } = args[0].query

  if (action === 'create') {
    return createBookmark(...args)
  }

  if (action === 'delete') {
    return deleteBookmark(...args)
  }

  if (action === 'comment') {
    return createComment(...args)
  }

  if (id) {
    return getBookmarkById(...args)
  }

  return getAllBookmarks(...args)
}

async function createComment(req, res) {
  const { text, entity } = await req.body
  const collection = entity.type === 'COLLECTION' ? 'Collections' : 'Bookmarks'
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    if (!text) {
      throw new Error('Text must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Create(Collection('Comments'), {
        data: {
          text,
          author: Select(['data', 'user'], Get(Identity())),
          created: Now(),
          entity: Ref(Collection(collection), entity.id),
        },
      })
    )

    res.status(200).json({
      ...data.data,
      id: data.ref.id,
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function createHashtags(tags) {
  // tags is an array that looks like:
  // [{ name: 'hash' }, { name: 'tag' }]
  return q.Map(
    tags,
    Lambda(
      ['hashtag'],
      Let(
        {
          match: Match(Index('hashtags_by_name'), Var('hashtag')),
        },
        If(
          Exists(Var('match')),
          // Paginate returns a { data: [ <references> ]} object. We
          // validated that there is one element with exists already.
          // We can fetch it with Select(['data', 0], ...)
          Select(['data', 0], Paginate(Var('match'))),
          // If it doesn't exist we create it and return the reference.
          Select(
            ['ref'],
            Create(Collection('Hashtags'), {
              data: { name: Var('hashtag') },
            })
          )
        )
      )
    )
  )
}

async function deleteBookmark(req, res) {
  const { id } = req.query
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

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
  const { title, description, details, category, tags } = req.body
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
    Let,
    Var,
  } = q

  try {
    if (!title) {
      throw new Error('Title and link must be provided.')
    }

    const data = await faunaClient(faunaSecret).query(
      Let(
        {
          hashtagRefs: await createHashtags(tags),
          category: Select(
            0,
            Paginate(Match(Index('categories_by_slug'), category))
          ),
          author: Select(['data', 'user'], Get(Identity())),
        },
        Create(Collection('Bookmarks'), {
          data: {
            title,
            description,
            likes: 0,
            comments: 0,
            hashtags: Var('hashtagRefs'),
            category: Var('category'),
            details,
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

async function getBookmarkById(req, res) {
  const { id } = req.query

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

async function getAllBookmarks(req, res) {
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
