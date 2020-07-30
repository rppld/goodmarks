import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
import Error from 'next/error'
import PageTitle from 'components/page-title'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import { BookmarksData } from 'lib/types'
import { bookmarkApi } from 'pages/api/bookmarks'
import BookmarkDetail from 'components/bookmark-detail'
import cookie from 'cookie'
import { FAUNA_SECRET_COOKIE } from 'lib/fauna'

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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { id } = params
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    return {
      props: {
        initialData: await bookmarkApi(id as string, faunaSecret),
        bookmarkId: id,
      },
    }
  } catch (error) {
    console.log(error)
  }
}

export default Bookmark
