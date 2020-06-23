import React from 'react'
import styles from './index.module.css'
import { HStack } from '../stack'
import Router from 'next/router'
import Embed from './embed'
import { Heart, ChatBubble, More } from '../icon'
import useLikeBookmark from 'utils/use-like-bookmark'
import useDeleteBookmark from 'utils/use-delete-bookmark'
import useRemoveBookmarkFromList from 'utils/use-remove-bookmark-from-list'
import { useViewer } from 'components/viewer-context'
import { Text } from '../text'
import AuthorInfo from '../author-info'
import Action from './action'
import AddToListDialog from '../add-to-list-dialog'

import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import {
  Bookmark,
  List,
  BookmarkStats,
  BookmarkCategory,
  User,
  CommentNode,
} from 'lib/types'

interface Props {
  bookmark: Bookmark
  category: BookmarkCategory
  bookmarkStats: BookmarkStats
  comments: CommentNode[]
  original?: Bookmark
  list?: List
  listItemId?: string
  user: User
  onLike?: () => void
  onDelete?: () => void
  onRemoveFromList?: (listItemId: string) => void
}

const BookmarkNode: React.FC<Props> = ({
  bookmark,
  category,
  bookmarkStats,
  comments,
  original,
  user,
  list,
  listItemId,
  ...props
}) => {
  const [likeBookmark, { loading: liking }] = useLikeBookmark()
  const [deleteBookmark, { loading: deleting }] = useDeleteBookmark()
  const [
    removeFromList,
    { loading: removingFromList },
  ] = useRemoveBookmarkFromList()
  const { viewer } = useViewer()
  const isOwnedByViewer = viewer && user?.id === viewer.id
  const [showDialog, setShowDialog] = React.useState(false)
  const openDialog = () => setShowDialog(true)
  const closeDialog = () => setShowDialog(false)

  const handleLike = async () => {
    props.onLike()
    await likeBookmark(bookmark.id)
  }

  const handleDelete = async () => {
    await deleteBookmark(bookmark.id)
    props.onDelete()
  }

  const handleRemoveFromList = async () => {
    const res = await removeFromList(listItemId, list.id)
    props.onRemoveFromList(listItemId)
    console.log(res)
  }

  const handleClick = (e) => {
    if (e.target.classList.contains('action')) {
      // Ignore container click if target is an action.
      return false
    }
    Router.push('/b/[id]', `/b/${bookmark.id}`)
  }

  if (!bookmark) {
    // Return blank item for deleted bookmark.
    return (
      <div className={styles.container}>
        <HStack spacing="md" alignment="space-between">
          <Text as="p" meta>
            This item is no longer available.
          </Text>
          {viewer && list ? (
            <Menu>
              <Action
                as={MenuButton}
                leftAdornment={<More size="sm" />}
                className="action"
              />
              <MenuList>
                <MenuItem
                  onSelect={handleRemoveFromList}
                  disabled={removingFromList}
                  className="action"
                >
                  {removingFromList ? 'Removing' : 'Remove from list'}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : null}
        </HStack>
      </div>
    )
  }

  return (
    <div className={styles.container} onClick={handleClick}>
      <header className={styles.header}>
        <HStack>
          <AuthorInfo user={user} createdAt={bookmark.created['@ts']} />
        </HStack>

        <HStack spacing="md">
          <Action
            active={bookmarkStats.like}
            leftAdornment={<Heart size="sm" />}
            onClick={viewer && handleLike}
            disabled={!viewer || liking}
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

          {viewer && (
            <Menu>
              <Action
                as={MenuButton}
                leftAdornment={<More size="sm" />}
                className="action"
              />
              <MenuList>
                <MenuItem onSelect={openDialog} className="action">
                  Add to list
                </MenuItem>

                {list && (
                  <MenuItem
                    onSelect={handleRemoveFromList}
                    disabled={removingFromList}
                    className="action"
                  >
                    {removingFromList ? 'Removing' : 'Remove from list'}
                  </MenuItem>
                )}

                {isOwnedByViewer && (
                  <MenuItem
                    onSelect={handleDelete}
                    disabled={deleting}
                    className="action"
                  >
                    {deleting ? 'Deleting' : 'Delete bookmark'}
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </HStack>
      </header>

      {bookmark.text && <Text as="p">{bookmark.text}</Text>}

      <Embed bookmark={bookmark} category={category.slug} />

      <AddToListDialog
        isOpen={showDialog}
        onDismiss={closeDialog}
        bookmarkId={bookmark.id}
        onSuccess={closeDialog}
      />
    </div>
  )
}

BookmarkNode.defaultProps = {
  onLike: () => {},
  onDelete: () => {},
  onRemoveFromList: () => {},
}

export default BookmarkNode
