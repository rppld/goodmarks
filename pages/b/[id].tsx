import React from 'react'
import { NextPage } from 'next'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { BookmarksData } from 'lib/types'
import { bookmarkApi } from 'pages/api/bookmarks'
import BookmarkDetail from 'components/bookmark-detail'

interface Props {
  initialData: BookmarksData
  bookmarkId: string
}

const Bookmark: NextPage<Props> = ({ initialData, bookmarkId }) => {
  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">Bookmark</H4>
      </PageTitle>
      <BookmarkDetail initialData={initialData} bookmarkId={bookmarkId} />
    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  const { id } = params
  const initialData = await bookmarkApi(id)
  return { props: { initialData, bookmarkId: id } }
}

export default Bookmark
