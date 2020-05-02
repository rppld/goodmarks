import React from 'react'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'

const NewTVShowForm = () => {
  return (
    <PageTitle>
      <H2 as="h1">TV show</H2>
      <Text meta>Select the TV show you want to bookmark.</Text>
    </PageTitle>
  )
}

export default NewTVShowForm
