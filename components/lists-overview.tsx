import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import ListNode from './list-node'
import { VStack } from './stack'
import { useRouter } from 'next/router'
import { useViewer } from 'components/viewer-context'
import Button from 'components/button'

const ListsOverview: React.FC = () => {
  const { viewer } = useViewer()
  const { query } = useRouter()
  const { data, error } = useSWR(
    () => query.user && `/api/lists?handle=${query.user}`
  )

  if (data?.edges?.length === 0) {
    return null
  }

  return (
    <VStack spacing="md">
      {viewer?.handle === query.user ? (
        <Link href="/lists/new" passHref>
          <Button as="a" variant="primary">
            New list
          </Button>
        </Link>
      ) : null}

      {data?.edges?.map(({ list }) => (
        <div key={list.id}>
          <Link
            href="/[user]/lists/[id]"
            as={`/${query.user}/lists/${list.id}`}
          >
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
