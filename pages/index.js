import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Layout from '../components/layout'

const Home = () => {
  const { data, error } = useSWR('/api/tips')

  return (
    <Layout>
      <h1>Tips from the people you’re following</h1>

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <ol>
          {data.tips.map((tip) => (
            <li key={tip.id}>
              <Link href="t/[id]" as={`/t/${tip.id}`}>
                <a>{tip.title}</a>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Layout>
  )
}

export default Home
