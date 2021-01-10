import React from 'react'
import { Text } from './text'
import { HStack, VStack } from './stack'
import Button from './button'
import bookmarkNodeStyles from './bookmark-node/index.module.css'
import styles from './invite-friends.module.css'
import clsx from 'clsx'

interface Props {
  text?: string
  shareTitle?: string
  shareText?: string
  shareUrl?: string
}

const InviteFriends: React.FC<Props> = ({
  text,
  shareTitle,
  shareText,
  shareUrl,
}) => {
  const [nativeShare, setNativeShare] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const inputEl: any = React.useRef(null)

  const shareData = {
    title: shareTitle,
    text: shareText,
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
      setNativeShare(false)
    }
  }

  return (
    <div className={clsx(styles.container, bookmarkNodeStyles.container)}>
      <VStack spacing="md">
        <header className={styles.header}>
          <Text as="p">{nativeShare ? text : 'How do you want to share?'}</Text>
        </header>
        <HStack alignment="leading">
          {nativeShare && (
            <Button variant="primary" onClick={share}>
              Share
            </Button>
          )}
          {!nativeShare && (
            <HStack>
              <Button onClick={copyToClipboard} variant="primary">
                {!copied ? 'Copy link' : 'Copied!'}
              </Button>

              <Button
                as="a"
                href={`whatsapp://send?text=${shareData.text} ${shareData.url}`}
                data-action="share/whatsapp/share"
                variant="primary"
              >
                WhatsApp
              </Button>
              <Button
                as="a"
                href={`https://twitter.com/intent/tweet?text=${shareData.text}&url=${shareData.url}`}
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
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

InviteFriends.defaultProps = {
  text: '',
  shareTitle: 'Goodmarks',
  shareText:
    'I’ve just joined Goodmarks, a community to share favorites with friends. Check out my recommendations here:',
  shareUrl: '//goodmarks.app',
}

export default InviteFriends
