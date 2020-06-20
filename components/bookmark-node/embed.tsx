import React from 'react'
import classNames from 'classnames'
import styles from './embed.module.css'
import { Text, Caption } from '../text'
import { Bookmark } from 'lib/types'
import { HStack } from '../stack'
import Image from '../image'
import { Movie, Link, TV } from '../icon'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'

interface Props {
  as?: React.ElementType | string
  bookmark: Bookmark
  category?: any
}

const getCategoryPlaceholder = (category) => {
  return (
    <span className={classNames(styles.placeholder, styles[category])}>
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

const Embed: React.FC<Props> = ({
  as: Component = 'a',
  bookmark,
  category,
}) => {
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
    <Component
      href={Component === 'a' ? url : undefined}
      className={classNames('action', styles.link)}
    >
      <div className={classNames(styles.container, styles[category])}>
        <HStack alignment="leading">
          <div className={styles.icon}>
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
          </div>
          <div className={styles.details}>
            <Text as="h4">
              {bookmark.details.title || bookmark.details.name}
            </Text>
            <Caption>
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
    </Component>
  )
}

export default Embed
