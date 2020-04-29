import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Layout from '../components/layout'

const Home = () => {
  const { data, error } = useSWR('/api/bookmarks')

  return (
    <Layout>
      <h1>Bookmarks from the people you’re following</h1>

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <ol>
          {data.bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
                <a>{bookmark.title}</a>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Layout>
  )
}

export default Home
