import React from 'react'
import { ListsData } from 'lib/types'
import { VStack } from 'components/stack'
import useSWR from 'swr'
import ListNode from 'components/list-node'

interface Props {
  initialData: ListsData
  listId: string
}

const ListDetail: React.FC<Props> = ({ initialData, listId }) => {
  const { data, error } = useSWR<ListsData>(
    () => listId && `/api/lists?id=${listId}`,
    { initialData }
  )
  const item = data?.edges?.length > 0 && data.edges[0]

  return (
    <div>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <VStack spacing="md">
          <ListNode {...item} />
        </VStack>
      )}
    </div>
  )
}

export default ListDetail
