import React from 'react'
import { useViewer } from 'components/viewer-context'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import Button from 'components/button'
import { ListsData } from 'lib/types'
import { VStack } from 'components/stack'
import useSWR from 'swr'
import useDeleteList from 'utils/use-delete-list'
import PageTitle from 'components/page-title'
import { H4 } from './heading'
import { Text } from './text'
import Toolbar from 'components/toolbar'
import TimeAgo from 'timeago-react'
import BookmarksFeed from 'components/bookmarks-feed'
import Spinner from './loader'

interface Props {
  initialData: ListsData
  listId: string
}

const ListDetail: React.FC<Props> = ({ initialData, listId }) => {
  const { viewer } = useViewer()
  const { query } = useRouter()
  const { data, error } = useSWR<ListsData>(
    () => listId && `/api/lists?id=${listId}`,
    { initialData }
  )
  const edge = data?.edges?.length > 0 && data.edges[0]
  const [deleteList, { loading: deleting }] = useDeleteList()

  const handleDelete = async () => {
    await deleteList(listId)
    const href = '/[user]/lists'
    const as = `/${query.user}/lists`
    Router.push(href, as)
  }

  return (
    <div>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <VStack spacing="md">
          <PageTitle>
            <H4 as="h1">{edge.list.name}</H4>
            <Text meta>
              By{' '}
              <Link href="/[user]" as={`/${edge.author.handle}`}>
                <a>@{edge.author.handle}</a>
              </Link>
              , updated <TimeAgo datetime={new Date(edge.list.ts / 1000)} />.
            </Text>
            <Text as="p">{edge.list.description}</Text>
          </PageTitle>

          {query?.user === viewer?.handle ? (
            <Toolbar>
              <Link
                href="/[user]/lists/[id]/edit"
                as={`/${query.user}/lists/${query.id}/edit`}
                passHref
              >
                <Button as="a" fullWidth>
                  Edit list
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                variant="danger"
                fullWidth
                disabled={deleting}
              >
                Delete list
              </Button>
            </Toolbar>
          ) : null}

          <BookmarksFeed list={listId} />
        </VStack>
      )}
    </div>
  )
}

export default ListDetail
