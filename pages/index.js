import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Layout from '../components/layout'
import { H2 } from '../components/heading'

const Home = () => {
  const { data, error } = useSWR('/api/bookmarks')

  return (
    <Layout>
      <H2 as="h1">Latest bookmarks</H2>

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
