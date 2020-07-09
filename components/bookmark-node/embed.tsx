import React from 'react'
import clsx from 'clsx'
import styles from './embed.module.css'
import { Text, Caption } from '../text'
import { Bookmark } from 'lib/types'
import Image from '../image'
import { Movie, Link, TV, Calendar, Star } from '../icon'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'

interface Props {
  as?: React.ElementType | string
  bookmark: Bookmark
  category?: any
}

const getCategoryPlaceholder = (category) => {
  return (
    <span className={clsx(styles.placeholder, styles[category])}>
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

  const releaseYear = getYear(
    parseISO(
      bookmark.details['first_air_date'] || bookmark.details['release_date']
    )
  )

  return (
    <Component
      href={Component === 'a' ? url : undefined}
      className={clsx('action', styles.link)}
    >
      <div className={clsx(styles.container, styles[category])}>
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
          <Text as="h4">{bookmark.details.title || bookmark.details.name}</Text>

          <div className={styles.meta}>
            {releaseYear ? (
              <Caption>
                <span className={styles.metaIcon}>
                  <Calendar size="xs" />
                </span>{' '}
                {releaseYear}
              </Caption>
            ) : null}

            {bookmark.details['vote_average'] ? (
              <Caption>
                <span className={styles.metaIcon}>
                  <Star size="xs" />
                </span>
                {bookmark.details['vote_average']}
              </Caption>
            ) : null}

            {bookmark.details.url ? (
              <Caption>{bookmark.details.url}</Caption>
            ) : null}
          </div>
        </div>
      </div>
    </Component>
  )
}

export default Embed
