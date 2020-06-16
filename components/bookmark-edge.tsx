import React from 'react'
import styles from './bookmark-edge.module.css'
import { HStack } from './stack'
import Router from 'next/router'
import Embed from './embed'
import { Heart, ChatBubble, ChatBubbleOutlined, HeartOutlined } from './icon'
import useLikeBookmark from 'utils/use-like-bookmark'
import { useViewer } from 'components/viewer-context'
import { Text } from './text'
import AuthorInfo from './author-info'
import Action from './action'

interface Props {
  bookmark: any
  category: any
  bookmarkStats: any
  comments: any
  original?: any
  user: any
  onLike?: () => void
}

const BookmarkEdge: React.FC<Props> = ({
  bookmark,
  category,
  bookmarkStats,
  comments,
  original,
  user,
  ...props
}) => {
  const [likeBookmark, { loading: liking }] = useLikeBookmark()
  const { viewer } = useViewer()

  const handleLike = async () => {
    props.onLike()
    await likeBookmark(bookmark.id)
  }

  const handleClick = (e) => {
    if (e.target.classList.contains('action')) {
      // Ignore container click if target is an action.
      return false
    }
    Router.push('/b/[id]', `/b/${bookmark.id}`)
  }

  return (
    <div className={styles.container} onClick={handleClick}>
      <HStack alignment="space-between">
        <HStack>
          <AuthorInfo user={user} createdAt={bookmark.created['@ts']} />
        </HStack>

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
            onClick={viewer && handleLike}
            disabled={liking}
            className="action"
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

      <Embed bookmark={bookmark} category={category.slug} />
    </div>
  )
}

export default BookmarkEdge
