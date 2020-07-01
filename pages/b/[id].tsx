import React from 'react'
import { NextPage } from 'next'
import cookie from 'cookie'
import Error from 'next/error'
import { FAUNA_SECRET_COOKIE } from 'lib/fauna'
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
  if (initialData.edges.length === 0) {
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

export async function getServerSideProps({ req, params }) {
  const { id } = params
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    const initialData = await bookmarkApi(id, faunaSecret)
    return { props: { initialData, bookmarkId: id } }
  } catch (error) {
    console.log(error)
  }
}

export default Bookmark
