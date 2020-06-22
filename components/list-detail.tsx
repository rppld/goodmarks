import React from 'react'
import { useViewer } from 'components/viewer-context'
import Router, { useRouter } from 'next/router'
import Button from 'components/button'
import { ListsData } from 'lib/types'
import { VStack } from 'components/stack'
import useSWR from 'swr'
import BookmarkNode from 'components/bookmark-node'
import ListNode from 'components/list-node'
import useDeleteList from 'utils/use-delete-list'

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
        <div>loading...</div>
      ) : (
        <VStack spacing="md">
          <ListNode {...edge} />

          {query?.user === viewer?.handle ? (
            <Button onClick={handleDelete} variant="danger" disabled={deleting}>
              Delete list
            </Button>
          ) : null}

          <div>
            {edge.items.map((item) => (
              <BookmarkNode {...item} key={item.bookmark.id} />
            ))}
          </div>
        </VStack>
      )}
    </div>
  )
}

export default ListDetail
