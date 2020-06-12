import React from 'react'
import styles from './item.module.css'
import { Text, Caption } from './text'
import { HStack } from './stack'
import Image from './image'
import { Movie, Link, TV } from './icon'

// TODO: Add proper types here.
interface Props {
  image?: any
  category?: any
  alt?: any
  title: any
  text?: any
}

const getCategoryPlaceholder = (category) => {
  return (
    <span className={styles.poster}>
      {category === 'tv-shows' ? (
        <TV />
      ) : category === 'movies' ? (
        <Movie />
      ) : (
        <Link />
      )}
    </span>
  )
}

const Item: React.FC<Props> = ({ image, alt, title, text, category }) => {
  return (
    <div className={styles.container}>
      <HStack alignment="leading">
        {image ? (
          <Image src={image} alt={alt} className={styles.poster} />
        ) : (
          getCategoryPlaceholder(category)
        )}
        <div className={styles.details}>
          <Text as="h4">{title}</Text>
          <Caption meta>{text}</Caption>
        </div>
      </HStack>
    </div>
  )
}

export default Item
