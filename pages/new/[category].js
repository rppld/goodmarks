import React from 'react'
import { useRouter } from 'next/router'
import { withAuthSync } from '../../lib/auth'
import profileOrRedirect from '../../lib/profile-or-redirect'
import NewMovieForm from '../../components/new-movie-form'
import NewTVShowForm from '../../components/new-tv-show-form'
import NewLinkForm from '../../components/new-link-form'

function getCategoryUI(handle) {
  switch (handle) {
    case 'movie':
      return <NewMovieForm />
    case 'tv-show':
      return <NewTVShowForm />
    case 'link':
      return <NewLinkForm />
    default:
      return <NewLinkForm />
  }
}

const Category = () => {
  const router = useRouter()
  const { category } = router.query || {}
  return getCategoryUI(category)
}

Category.getInitialProps = async (ctx) => {
  const viewer = await profileOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(Category)
