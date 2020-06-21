import React from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'

const ListsOverview: React.FC = () => {
  const { query } = useRouter()
  const { data, error } = useSWR(
    () => query.user && `/api/lists?handle=${query.user}`
  )

  return (
    <div>
      {data?.edges?.length > 0 ? (
        <ul>
          {data.edges.map(({ list }) => (
            <li key={list.id}>
              <Link
                href="/[user]/lists/[id]"
                as={`/${query.user}/lists/${list.id}`}
              >
                <a>{list.name}</a>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default ListsOverview
