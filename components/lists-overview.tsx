import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import ListNode from './list-node'
import { useRouter } from 'next/router'

const ListsOverview: React.FC = () => {
  const { query } = useRouter()
  const { data, error } = useSWR(
    () => query.user && `/api/lists?handle=${query.user}`
  )

  return (
    <div>
      {data?.edges?.length > 0 ? (
        <div>
          {data.edges.map(({ list }) => (
            <Link
              href="/[user]/lists/[id]"
              as={`/${query.user}/lists/${list.id}`}
              key={list.id}
            >
              <a>
                <ListNode list={list} />
              </a>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ListsOverview
