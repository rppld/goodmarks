import React from 'react'
import Router from 'next/router'
import simpleOauth2 from 'simple-oauth2'

export const logout = async () => {
  await fetch('/api/logout')
  window.localStorage.setItem('logout', Date.now())
  Router.push('/login')
}

export const withAuthSync = (Component) => {
  const Wrapper = (props) => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        console.log('logged out from storage!')
        Router.push('/login')
      }
    }

    React.useEffect(() => {
      window.addEventListener('storage', syncLogout)

      return () => {
        window.removeEventListener('storage', syncLogout)
        window.localStorage.removeItem('logout')
      }
    }, [])

    return <Component {...props} />
  }

  if (Component.getInitialProps) {
    Wrapper.getInitialProps = Component.getInitialProps
  }

  return Wrapper
}

export const googleOauth2 = simpleOauth2.create({
  client: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token',
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
  },
})
