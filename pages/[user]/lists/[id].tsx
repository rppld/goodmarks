import React from 'react'
import { NextPage } from 'next'
import Error from 'next/error'
import cookie from 'cookie'
import { FAUNA_SECRET_COOKIE } from 'lib/fauna'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import ListDetail from 'components/list-detail'
import { ListsData } from 'lib/types'
import { listApi } from 'pages/api/lists'

interface Props {
  initialData: ListsData
  listId: string
  error?: {
    code: number
    message: string
  }
}

const Lists: NextPage<Props> = ({ initialData, listId, error }) => {
  if (error) {
    return <Error statusCode={error.code} title={error.message} />
  }

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">List</H4>
      </PageTitle>
      {error ? error : <ListDetail initialData={initialData} listId={listId} />}
    </Layout>
  )
}

// SSR this page, because lists can be private and in that case we
// should return an appropriate error page and status code.
export async function getServerSideProps({ req, params }) {
  const { id } = params
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  try {
    const initialData = await listApi(id, faunaSecret)
    return { props: { initialData, listId: id } }
  } catch (error) {
    console.log(error)
    return {
      props: {
        error: {
          code: 401,
          message: error.message,
        },
      },
    }
  }
}

export default Lists
