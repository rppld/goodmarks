import React from 'react'
import { User, Comment } from 'lib/types'
import Link from 'next/link'
import { More } from './icon'
import { HStack } from './stack'
import getImageUrl from 'utils/get-image-url'
import styles from './comment-edge.module.css'
import TimeAgo from 'timeago-react'
import { useViewer } from './viewer-context'
import { SmallText } from './text'
import Avatar from './avatar'
import Action from './action'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

interface Props {
  author: User
  comment: Comment
  onDelete: (commentId: string) => void
}

const CommentEdge: React.FC<Props> = ({ author, comment, ...props }) => {
  const { viewer } = useViewer()

  return (
    <div className={styles.container}>
      <div className={styles.avatarContainer}>
        <Link href="/[id]" as={`/${author.handle}`}>
          <a className="action">
            <Avatar
              size="sm"
              src={author.picture && getImageUrl(author.picture, 'avatarLg')}
            />
          </a>
        </Link>
      </div>

      <div>
        <header className={styles.header}>
          <HStack>
            <Link href="/[id]" as={`/${author.handle}`}>
              <a className="action">
                <SmallText>@{author.handle}</SmallText>
              </a>
            </Link>

            <SmallText>
              <TimeAgo datetime={comment.created['@ts']} />
            </SmallText>

            {author.id === viewer?.id ? (
              <Menu>
                <MenuButton>
                  <Action as="span" leftAdornment={<More size="sm" />} />
                </MenuButton>
                <MenuList>
                  <MenuItem onSelect={() => props.onDelete(comment.id)}>
                    Delete comment
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : null}
          </HStack>
        </header>

        <SmallText>{comment.text}</SmallText>
      </div>
    </div>
  )
}

export default CommentEdge
