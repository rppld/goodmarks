import React from 'react'
import classNames from 'classnames'
import styles from './bookmark.module.css'
import { HStack } from './stack'
import Item from './item'
import Link from 'next/link'
import { Heart, ChatBubble, ChatBubbleOutlined, HeartOutlined } from './icon'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import useLikeBookmark from 'utils/use-like-bookmark'
import { Text } from './text'
import AuthorInfo from './author-info'

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
  category: any
  bookmarkStats: any
  comments: any
  original?: any
  user: any
  onLike?: () => void
}

const Bookmark: React.FC<Props> = ({
  bookmark,
  category,
  bookmarkStats,
  comments,
  original,
  user,
  ...props
}) => {
  const [likeBookmark, { loading: liking }] = useLikeBookmark()

  const handleLike = async () => {
    props.onLike()
    await likeBookmark(bookmark.id)
  }

  return (
    <div className={styles.container}>
      <HStack alignment="space-between">
        <AuthorInfo user={user} timestamp={bookmark.created['@ts']} />
        <HStack>
          <Action
            active={bookmarkStats.like}
            leftAdornment={
              bookmarkStats.like ? (
                <Heart size="sm" />
              ) : (
                <HeartOutlined size="sm" />
              )
            }
            onClick={handleLike}
            disabled={liking}
          >
            {bookmark.likes}
          </Action>
          <Action
            as="span"
            active={bookmarkStats.comment}
            leftAdornment={
              bookmarkStats.comment ? (
                <ChatBubble size="sm" />
              ) : (
                <ChatBubbleOutlined size="sm" />
              )
            }
          >
            {bookmark.comments}
          </Action>
        </HStack>
      </HStack>
      <div className={styles.text}>
        {bookmark.text && <Text as="p">{bookmark.text}</Text>}
      </div>
      <Link href="/b/[id]" as={`/b/${bookmark.id}`}>
        <a>
          <Item
            title={bookmark.details.title || bookmark.details.name}
            category={category.slug}
            text={
              getYear(
                parseISO(
                  bookmark.details['first_air_date'] ||
                    bookmark.details['release_date']
                )
              ) || bookmark.details.url
            }
            image={
              bookmark.details['poster_path'] &&
              `https://image.tmdb.org/t/p/w220_and_h330_face/${bookmark.details['poster_path']}`
            }
            alt={`Poster for ${bookmark.title}`}
          />
        </a>
      </Link>
    </div>
  )
}

export default Bookmark
