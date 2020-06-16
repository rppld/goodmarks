import React from 'react'
import styles from './embed.module.css'
import { Text, Caption } from './text'
import { Bookmark } from 'lib/types'
import { HStack } from './stack'
import Image from './image'
import { Movie, Link, TV } from './icon'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'

interface Props {
  bookmark: Bookmark
  category?: any
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

const Embed: React.FC<Props> = ({ bookmark, category }) => {
  const image =
    bookmark.details['poster_path'] &&
    `https://image.tmdb.org/t/p/w220_and_h330_face/${bookmark.details['poster_path']}`

  const url =
    category === 'tv-shows'
      ? `https://www.themoviedb.org/tv/${bookmark.details.id}`
      : category === 'movies'
      ? `https://www.themoviedb.org/movie/${bookmark.details.id}`
      : bookmark.details.url

  return (
    <a href={url} className="action">
      <div className={styles.container}>
        <HStack alignment="leading">
          {image ? (
            <Image
              src={image}
              alt={`Thumbnail for ${
                bookmark.details.title || bookmark.details.name
              }`}
              className={styles.poster}
            />
          ) : (
            getCategoryPlaceholder(category)
          )}
          <div className={styles.details}>
            <Text as="h4">
              {bookmark.details.title || bookmark.details.name}
            </Text>
            <Caption meta>
              {getYear(
                parseISO(
                  bookmark.details['first_air_date'] ||
                    bookmark.details['release_date']
                )
              ) || bookmark.details.url}
            </Caption>
          </div>
        </HStack>
      </div>
    </a>
  )
}

export default Embed
