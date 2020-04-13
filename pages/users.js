import React from 'react'
import useSWR from 'swr'
import Layout from '../components/layout'

const Users = () => {
  const { data, error } = useSWR('/api/users')

  return (
    <Layout>
      <h1>All users</h1>

      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <ol>
          {data.users.map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ol>
      )}
    </Layout>
  )
}

export default Users
