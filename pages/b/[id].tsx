import React from 'react'
import { NextPage } from 'next'
import Error from 'next/error'
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
  if (initialData?.edges?.length === 0) {
    return <Error statusCode={404} title="Not found" />
  }

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

  try {
    const initialData = await bookmarkApi(id)
    return {
      props: {
        initialData,
        bookmarkId: id,
        // We will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 1,
      },
    }
  } catch (error) {
    console.log(error)
  }
}

export default Bookmark
