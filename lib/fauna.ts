import faunadb, { query as q } from 'faunadb'
import cookie from 'cookie'

export const FAUNA_SECRET_COOKIE = 'faunaSecret'

export const serverClient = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
})

// Used for any authed requests.
export const faunaClient = (secret) =>
  new faunadb.Client({
    secret,
  })

export const serializeFaunaCookie = (userSecret) => {
  return cookie.serialize(FAUNA_SECRET_COOKIE, userSecret, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })
}

export function flattenDataKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((e) => flattenDataKeys(e))
  } else if (typeof obj === 'object') {
    // The case where we have just data pointing to an array.
    if (Object.keys(obj).length === 1 && obj.data && Array.isArray(obj.data)) {
      return flattenDataKeys(obj.data)
    } else {
      Object.keys(obj).forEach((k) => {
        if (k === 'ref') {
          // Return plain `id` instead of `ref` object.
          const r = obj[k]
          delete obj.ref
          obj['id'] = r.id
        }
        if (k === 'data') {
          const d = obj[k]
          delete obj.data

          Object.keys(d).forEach((dataKey) => {
            obj[dataKey] = flattenDataKeys(d[dataKey])
          })
        } else {
          obj[k] = flattenDataKeys(obj[k])
        }
      })
    }
    return obj
  } else {
    return obj
  }
}

export async function createHashtags(items) {
  // items is an array that looks like:
  // [{ name: 'hash' }, { name: 'tag' }]
  return q.Map(
    items,
    q.Lambda(
      ['hashtag'],
      q.Let(
        {
          match: q.Match(q.Index('hashtags_by_name'), q.Var('hashtag')),
        },
        q.If(
          q.Exists(q.Var('match')),
          // Paginate returns a { data: [ <references> ]} object. We
          // validated that there is one element with exists already.
          // We can fetch it with Select(['data', 0], ...)
          q.Select(['data', 0], q.Paginate(q.Var('match'))),
          // If it doesn't exist we create it and return the reference.
          q.Select(
            ['ref'],
            q.Create(q.Collection('Hashtags'), {
              data: { name: q.Var('hashtag') },
            })
          )
        )
      )
    )
  )
}
