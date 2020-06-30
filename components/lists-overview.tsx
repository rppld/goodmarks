import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import ListNode from './list-node'
import { VStack } from './stack'

interface Props {
  handle: string | string[]
}

const ListsOverview: React.FC<Props> = ({ handle }) => {
  const { data, error } = useSWR(`/api/lists?handle=${handle}`)

  if (data?.edges?.length === 0) {
    return null
  }

  return (
    <VStack spacing="md">
      {data?.edges?.map(({ list }) => (
        <div key={list.id}>
          <Link href="/[user]/lists/[id]" as={`/${handle}/lists/${list.id}`}>
            <a>
              <ListNode list={list} />
            </a>
          </Link>
        </div>
      ))}
    </VStack>
  )
}

export default ListsOverview
