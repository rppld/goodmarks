import React from 'react'
import styles from './item.module.css'
import Text from './text'
import { H4 } from './heading'
import { HStack } from './stack'
import Image from './image'

// TODO: Add proper types here.
interface Props {
  image?: any
  alt?: any
  title: any
  text?: any
}

const Item: React.FC<Props> = ({ image, alt, title, text }) => {
  return (
    <div className={styles.container}>
      <HStack alignment="leading">
        {image && <Image src={image} alt={alt} className={styles.poster} />}
        <span>
          <H4>{title}</H4>
          <Text meta>{text}</Text>
        </span>
      </HStack>
    </div>
  )
}

export default Item
