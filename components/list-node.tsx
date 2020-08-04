import React from 'react'
import styles from './list-node.module.css'
import { H5 } from './heading'
import { Text, SmallText } from './text'
import { VStack } from './stack'
import { List } from 'lib/types'
import TimeAgo from 'timeago-react'

interface Props {
  list: List
}

const ListNode: React.FC<Props> = ({ list }) => {
  return (
    <div className={styles.container}>
      <VStack>
        <H5>{list.name}</H5>
        <Text as="p">{list.description}</Text>
        <SmallText meta as="p">
          Last updated: <TimeAgo datetime={new Date(list.ts / 1000)} />
        </SmallText>
      </VStack>
    </div>
  )
}

export default ListNode
