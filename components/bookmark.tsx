import React from 'react'
import classNames from 'classnames'
import styles from './bookmark.module.css'
import { HStack, VStack } from './stack'
import Avatar from './avatar'
import Item from './item'
import Link from 'next/link'
import { H5 } from './heading'
import { Heart, SpeechBubble } from './icon'
import TimeAgo from 'timeago-react'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'

interface ActionProps {
  active?: boolean
  leftAdornment?: any
}

const Action: React.FC<ActionProps> = ({ active, leftAdornment, children }) => {
  const className = classNames(styles.action, active && styles.active)

  return (
    <button className={className}>
      {leftAdornment && (
        <span className={styles.adornment}>{leftAdornment}</span>
      )}
      {children}
    </button>
  )
}

// TODO: Add proper types here.
interface Props {
  bookmark: any
  bookmarkStats: any
  comments: any
  original?: any
  user: any
}

const Bookmark: React.FC<Props> = ({
  bookmark,
  bookmarkStats,
  comments,
  original,
  user,
}) => {
  console.log(bookmark.created['@ts'])
  return (
    <div className={styles.container}>
      <VStack>
        <HStack alignment="space-between">
          <HStack>
            <Avatar src={user.picture} />
            <div>
              <H5>@{user.handle}</H5>
              <span className={styles['time-ago']}>
                <TimeAgo datetime={bookmark.created['@ts']} />
              </span>
            </div>
          </HStack>
          <HStack>
            <Action active={bookmarkStats.like} leftAdornment={<Heart />}>
              {bookmark.likes}
            </Action>
            <Action
              active={bookmarkStats.comment}
              leftAdornment={<SpeechBubble />}
            >
              {bookmark.comments}
            </Action>
          </HStack>
        </HStack>
        {bookmark.description && <div>{bookmark.description}</div>}
        <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
          <a>
            <Item
              title={bookmark.title}
              text={getYear(
                parseISO(
                  bookmark.details['first_air_date'] ||
                    bookmark.details['release_date']
                )
              )}
              image={`https://image.tmdb.org/t/p/w220_and_h330_face/${bookmark.details['poster_path']}`}
              alt={`Poster for ${bookmark.title}`}
            />
          </a>
        </Link>
      </VStack>
    </div>
  )
}

export default Bookmark
