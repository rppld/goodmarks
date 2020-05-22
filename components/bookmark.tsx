import React from 'react'
import classNames from 'classnames'
import styles from './bookmark.module.css'
import { HStack, VStack } from './stack'
import { BookmarksData } from 'lib/types'
import Avatar from './avatar'
import Item from './item'
import Link from 'next/link'
import { H5 } from './heading'
import { Heart, SpeechBubble } from './icon'
import TimeAgo from 'timeago-react'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import useLikeBookmark from 'utils/use-like-bookmark'

interface ActionProps extends React.ComponentProps<'button'> {
  as?: React.ElementType | string
  active?: boolean
  leftAdornment?: any
}

const Action: React.FC<ActionProps> = ({
  as: Component = 'button',
  active,
  leftAdornment,
  children,
  ...props
}) => {
  const className = classNames(styles.action, active && styles.active)

  return (
    <Component className={className} {...props}>
      {leftAdornment && (
        <span className={styles.adornment}>{leftAdornment}</span>
      )}
      {children}
    </Component>
  )
}

// TODO: Add proper types here.
interface Props {
  bookmark: any
  bookmarkStats: any
  comments: any
  original?: any
  user: any
  onLike?: (newData: BookmarksData) => void
}

const Bookmark: React.FC<Props> = ({
  bookmark,
  bookmarkStats,
  comments,
  original,
  user,
  ...props
}) => {
  const [likeBookmark, { loading: liking }] = useLikeBookmark()

  const handleLike = async () => {
    props.onLike(await likeBookmark(bookmark.id))
  }

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
            <Action
              active={bookmarkStats.like}
              leftAdornment={<Heart />}
              onClick={handleLike}
              disabled={liking}
            >
              {bookmark.likes}
            </Action>
            <Action
              as="span"
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
