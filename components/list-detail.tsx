import React from 'react'
import { useViewer } from 'components/viewer-context'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import Button from 'components/button'
import { ListsData } from 'lib/types'
import { VStack, HStack } from 'components/stack'
import useSWR from 'swr'
import BookmarkNode from 'components/bookmark-node'
import useDeleteList from 'utils/use-delete-list'
import { H2 } from './heading'
import { Text } from './text'
import AuthorInfo from './author-info'
import { Pencil, Trash } from './icon'

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

  console.log(edge)

  return (
    <div>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <VStack spacing="md">
          <AuthorInfo
            user={edge.author}
            subtitle="Last updated: "
            createdAt={edge.list.created['@ts']}
          />

          <VStack spacing="sm">
            <H2>{edge.list.name}</H2>
            <Text as="p">{edge.list.description}</Text>
          </VStack>

          {query?.user === viewer?.handle ? (
            <HStack alignment="leading">
              <Link
                href="/[user]/lists/[id]/edit"
                as={`/${query.user}/lists/${query.id}/edit`}
                passHref
              >
                <Button as="a" leftAdornment={<Pencil />} iconOnly>
                  Edit list
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                variant="danger"
                disabled={deleting}
                iconOnly
                leftAdornment={<Trash />}
              >
                Delete list
              </Button>
            </HStack>
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
