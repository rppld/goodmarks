import React from 'react'
import Link from 'next/link'
import { Text } from './text'
import { HStack, VStack } from './stack'
import Button from './button'
import bookmarkNodeStyles from './bookmark-node/index.module.css'
import styles from './search-and-share.module.css'
import { useViewer } from './viewer-context'

const SearchAndShare: React.FC = () => {
  const [shareActions, setShareActions] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const inputEl: any = React.useRef(null)

  const { viewer } = useViewer()

  let shareUrl = '//goodmarks.app'
  if (viewer && window) {
    shareUrl = window.location.origin + '/' + viewer.handle
  }

  const shareData = {
    title: 'Goodmarks',
    text:
      'I’ve just joined Goodmarks, a community to share favorites with friends. Check out my recommendations here:',
    url: shareUrl,
  }

  const copyToClipboard = (event) => {
    inputEl.current.select()
    document.execCommand('copy')
    event.target.focus()
    setCopied(true)
  }

  const share = async () => {
    try {
      // Try to use a native share dialog
      await navigator.share(shareData)
    } catch (err) {
      // Show custom share options if native share options didn't work
      setShareActions(true)
    }
  }

  return (
    <div className={bookmarkNodeStyles.container}>
      <VStack spacing="md">
        <header className={styles.header}>
          <Text as="p">
            {!shareActions
              ? 'Search and follow other people or invite your friends to follow you.'
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
              <Button variant="primary" onClick={share}>
                Invite friends
              </Button>
            </>
          )}
          {shareActions && (
            <HStack>
              <Button onClick={copyToClipboard}>
                {!copied ? 'Copy link' : 'Copied!'}
              </Button>

              <Button
                as="a"
                href={`whatsapp://send?text=${shareData.text} ${shareData.url}`}
                data-action="share/whatsapp/share"
              >
                WhatsApp
              </Button>
              <Button
                as="a"
                href={`https://twitter.com/intent/tweet?text=${shareData.text}&url=${shareData.url}`}
              >
                Twitter
              </Button>

              {/* Hidden inputElement to allow copying something to the clipboard without permission */}
              <input
                readOnly
                type="text"
                value={shareData.url}
                className={styles.hiddenInput}
                ref={inputEl}
              />
            </HStack>
          )}
        </HStack>
      </VStack>
    </div>
  )
}

export default SearchAndShare
