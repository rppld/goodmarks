import React from 'react'
import styles from './lists-overview.module.css'
import useSWR from 'swr'
import Link from 'next/link'
import ListNode from './list-node'
import { VStack } from './stack'
import { SmallText } from './text'

interface Props {
  handle: string | string[]
}

const ListsOverview: React.FC<Props> = ({ handle }) => {
  const { data, error } = useSWR(`/api/lists?handle=${handle}`)

  if (data?.edges?.length === 0) {
    return (
      <div className={styles['empty-state']}>
        <SmallText meta>{handle} doesn't have any lists yet</SmallText>
      </div>
    )
  } else if (data) {
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
  } else {
    return (
      <div className={styles['empty-state']}>
        <SmallText meta>Loading...</SmallText>
      </div>
    )
  }
}

export default ListsOverview
