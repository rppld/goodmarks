import React from 'react'
import classNames from 'classnames'
import styles from './movie-header.module.css'
import { H2, H3, H6 } from './heading'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import Image from './image'

interface Props {
  as?: React.ElementType | string
  title: string
  releaseDate: string
  posterPath: string | false
  backdropPath: string | false
}

const MovieHeader: React.FC<Props> = ({
  children,
  title,
  releaseDate,
  posterPath,
  backdropPath,
  ...props
}) => {
  const className = classNames(styles.header)

  const baseUrl = {
    sm: 'https://image.tmdb.org/t/p/w185/',
    md: 'https://image.tmdb.org/t/p/w342/',
    xl: 'https://image.tmdb.org/t/p/w780/',
  }

  const heroStyles = {
    backgroundImage: `url(${baseUrl.sm}${backdropPath})`,
  }

  return (
    <header className={className} {...props}>
      {posterPath && (
        <div className={styles.heroWrapper}>
          <div className={styles.hero} style={heroStyles} />
          <div className={styles.poster}>
            <Image
              src={`${baseUrl.sm}${posterPath}`}
              srcSet={`${baseUrl.sm}${posterPath} 1x, ${baseUrl.md}${posterPath} 2x`}
              alt={`Poster for ${title}`}
            />
          </div>
        </div>
      )}

      <div>
        <H6 as="strong">Movie</H6>
        <H2 as="h1">{title}</H2>
        <H3 as="p">{getYear(parseISO(releaseDate))}</H3>
        {children}
      </div>
    </header>
  )
}

export default MovieHeader
