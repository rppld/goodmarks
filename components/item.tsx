import React from 'react'
import styles from './item.module.css'
import { Text, CaptionText } from './text'
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
        <div className={styles.meta}>
          <Text as="h4">{title}</Text>
          <CaptionText meta>{text}</CaptionText>
        </div>
      </HStack>
    </div>
  )
}

export default Item
