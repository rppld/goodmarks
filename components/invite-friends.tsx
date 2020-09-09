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
  const [copied, setCopied] = React.useState(false)
  const inputEl: any = React.useRef(null)

  const { viewer } = useViewer()

  const shareText =
    'I’ve just joined Goodmarks, a community to share favorites with friends. Check out my recommendations here:'
  const shareUrl = window.location.origin + '/' + viewer.handle

  const nativeShareData = {
    title: 'Goodmarks',
    text: shareText,
    url: shareUrl,
  }

  const copyToClipboard = (event) => {
    inputEl.current.select()
    document.execCommand('copy')
    event.target.focus()
    setCopied(true)
  }

  const openNativeShare = async () => {
    try {
      await navigator.share(nativeShareData)
      console.log('MDN shared successfully')
    } catch (err) {
      console.log('Error: ' + err)
    }
  }

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

              <Button onClick={openNativeShare}>Native Share Test</Button>
            </>
          )}
          {shareActions && (
            <HStack>
              <Button onClick={copyToClipboard}>
                {!copied ? 'Copy link' : 'Copied!'}
              </Button>

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

              {/* Hidden inputElement to allow copying something to the clipboard without permission */}
              <input
                readOnly
                type="text"
                value={shareText + ' ' + shareUrl}
                className={styles.hiddenInput}
                ref={inputEl}
              ></input>
            </HStack>
          )}
        </HStack>
      </VStack>
    </div>
  )
}

export default InviteFriends
