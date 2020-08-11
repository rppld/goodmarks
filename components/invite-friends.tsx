import React from 'react'
import Link from 'next/link'
import { Text } from './text'
import { HStack, VStack } from './stack'
import Button from './button'
import bookmarkNodeStyles from './bookmark-node/index.module.css'
import styles from './invite-friends.module.css'
import { useViewer } from './viewer-context'

const InviteFriends: React.FC = () => {
  const [shareActions, setShareActions] = React.useState(false)
  const { viewer } = useViewer()

  const shareText =
    "I've just joined Goodmarks, a community to share favorites with friends. Check out my recommendations here:"
  const shareUrl = 'https://goodmarks.vercel.app/' + viewer.handle

  return (
    <div className={bookmarkNodeStyles.container}>
      <VStack spacing="md">
        <header className={styles.header}>
          <Text as="p">
            {!shareActions
              ? 'Search and follow people or invite your friends to get started.'
              : 'Where do you want to share Goodmarks?'}
          </Text>
        </header>
        <HStack alignment="leading">
          {!shareActions && (
            <>
              <Link href="/search" passHref>
                <Button as="a" variant="primary">
                  Search
                </Button>
              </Link>
              <Button as="a" onClick={() => setShareActions(true)}>
                Share with friends
              </Button>
            </>
          )}
          {shareActions && (
            <HStack>
              <Button
                as="a"
                href={`whatsapp://send?text=${shareText} ${shareUrl}`}
                data-action="share/whatsapp/share"
              >
                WhatsApp
              </Button>
              <Button
                as="a"
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              >
                Twitter
              </Button>
            </HStack>
          )}
        </HStack>
      </VStack>
    </div>
  )
}

export default InviteFriends
