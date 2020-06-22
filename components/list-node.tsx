import React from 'react'
import styles from './list-node.module.css'
import TimeAgo from 'timeago-react'
import { H4 } from './heading'
import { Text, SmallText } from './text'
import Link from 'next/link'
import { VStack } from './stack'

interface Props {
  id: string
  title: string
  description: string
  datetime: string
}

const ListEdge: React.FC<Props> = ({ id, title, description, datetime }) => {
  return (
    <Link href={`/list/[id]`} as={`/list/${id}`}>
      <div className={styles.container}>
        <VStack>
          <H4>{title}</H4>
          <Text>{description}</Text>
          <SmallText meta>
            Last updated: <TimeAgo datetime={datetime} />
          </SmallText>
        </VStack>
      </div>
    </Link>
  )
}

export default ListEdge
