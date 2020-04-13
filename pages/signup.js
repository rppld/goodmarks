import React, { useState } from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Input from '../components/input'
import Button from '../components/button'

function Signup() {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    error: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })

    const email = userData.email
    const password = userData.password

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      Router.push('/profile')
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
    }
  }

  return (
    <Layout>
      <div className="signup">
        <form onSubmit={handleSubmit}>
          <Input
            name="email"
            labelText="Email"
            value={userData.email}
            onChange={(event) =>
              setUserData(
                Object.assign({}, userData, { email: event.target.value })
              )
            }
          />

          <Input
            type="password"
            name="password"
            labelText="Password"
            value={userData.password}
            onChange={(event) =>
              setUserData(
                Object.assign({}, userData, { password: event.target.value })
              )
            }
          />

          <Button type="submit">Sign up</Button>

          {userData.error && <p className="error">Error: {userData.error}</p>}
        </form>
      </div>
      <style jsx>{`
        .signup {
          max-width: 340px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        form {
          display: flex;
          flex-flow: column;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

export default Signup
