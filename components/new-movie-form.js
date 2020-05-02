import React from 'react'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'
import MovieSearch from './movie-search'

const NewMovieForm = () => {
  return (
    <>
      <PageTitle>
        <H2 as="h1">Movie</H2>
        <Text meta>Select the movie you want to bookmark.</Text>
      </PageTitle>
      <MovieSearch />
    </>
  )
}

export default NewMovieForm
