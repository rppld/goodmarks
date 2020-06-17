import React from 'react'
import styles from './index.module.css'
import { HStack } from '../stack'
import Router from 'next/router'
import Embed from './embed'
import classNames from 'classnames'
import { Heart, ChatBubble, More } from '../icon'
import useLikeBookmark from 'utils/use-like-bookmark'
import useDeleteBookmark from 'utils/use-delete-bookmark'
import { useViewer } from 'components/viewer-context'
import { Text } from '../text'
import AuthorInfo from './author-info'
import Action from './action'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

interface Props {
  bookmark: any
  category: any
  bookmarkStats: any
  comments: any
  original?: any
  user: any
  onLike?: () => void
  onDelete?: () => void
}

const BookmarkNode: React.FC<Props> = ({
  bookmark,
  category,
  bookmarkStats,
  comments,
  original,
  user,
  ...props
}) => {
  const [likeBookmark, { loading: liking }] = useLikeBookmark()
  const [deleteBookmark, { loading: deleting }] = useDeleteBookmark()
  const { viewer } = useViewer()
  const isOwnedByViewer = viewer && user?.id === viewer.id

  const handleLike = async () => {
    props.onLike()
    await likeBookmark(bookmark.id)
  }

  const handleDelete = async () => {
    await deleteBookmark(bookmark.id)
    props.onDelete()
  }

  const handleClick = (e) => {
    if (e.target.classList.contains('action')) {
      // Ignore container click if target is an action.
      return false
    }
    Router.push('/b/[id]', `/b/${bookmark.id}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.body} onClick={handleClick}>
        <header className={styles.header}>
          <HStack>
            <AuthorInfo user={user} createdAt={bookmark.created['@ts']} />
          </HStack>

          <HStack spacing="md">
            <Action
              active={bookmarkStats.like}
              leftAdornment={<Heart size="sm" />}
              onClick={viewer && handleLike}
              disabled={liking}
              className="action"
              isLikeToggle={true}
            >
              {bookmark.likes > 0 ? bookmark.likes : null}
            </Action>

            <Action
              as="span"
              active={bookmarkStats.comment}
              leftAdornment={<ChatBubble size="sm" />}
            >
              {bookmark.comments > 0 ? bookmark.comments : null}
            </Action>

            {isOwnedByViewer && (
              <Menu>
                <Action
                  as={MenuButton}
                  leftAdornment={<More size="sm" />}
                  className="action"
                />
                <MenuList>
                  <MenuItem
                    onSelect={handleDelete}
                    disabled={deleting}
                    className="action"
                  >
                    {deleting ? 'Deleting' : 'Delete bookmark'}
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </header>

        <div className={styles.text}>
          {bookmark.text && <Text as="p">{bookmark.text}</Text>}
        </div>
      </div>

      <Embed bookmark={bookmark} category={category.slug} />
    </div>
  )
}

export default BookmarkNode
