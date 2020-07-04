import React from 'react'
import { useViewer } from 'components/viewer-context'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import Button from 'components/button'
import { ListsData } from 'lib/types'
import { VStack } from 'components/stack'
import useSWR from 'swr'
import BookmarkNode from 'components/bookmark-node'
import useDeleteList from 'utils/use-delete-list'
import PageTitle from 'components/page-title'
import { H4 } from './heading'
import { Text } from './text'
import Toolbar from 'components/toolbar'

interface Props {
  initialData: ListsData
  listId: string
}

const ListDetail: React.FC<Props> = ({ initialData, listId }) => {
  const { viewer } = useViewer()
  const { query } = useRouter()
  const { data, error, mutate } = useSWR<ListsData>(
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

  const handleRemoveFromList = async (listItemId) => {
    // Remove item from cached data.
    mutate(
      {
        edges: [
          {
            ...edge,
            items: edge.items.filter((item) => item.id !== listItemId),
          },
        ],
      },
      false
    )
  }

  return (
    <div>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <VStack spacing="md">
          <PageTitle>
            <H4 as="h1">{edge.list.name}</H4>
            <Text meta>
              By{' '}
              <Link href="/[user]" as={`/${edge.author.handle}`}>
                <a>@{edge.author.handle}</a>
              </Link>
              , {edge.list.ts}
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
                <Button fullWidth>Edit list</Button>
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

          <VStack spacing="sm">
            {edge.items.map((item) => (
              <BookmarkNode
                {...item.bookmark}
                key={item.id}
                list={edge.list}
                listItemId={item.id}
                onRemoveFromList={handleRemoveFromList}
                linkToBookmarkDetail
              />
            ))}
          </VStack>
        </VStack>
      )}
    </div>
  )
}

export default ListDetail
