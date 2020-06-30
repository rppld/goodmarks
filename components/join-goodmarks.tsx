import React from 'react'
import Link from 'next/link'
import { Text } from './text'
import { HStack, VStack } from './stack'
import Button from './button'
import bookmarkNodeStyles from './bookmark-node/index.module.css'
import styles from './join-goodmarks.module.css'
import { useViewer } from './viewer-context'

const JoinGoodmarks: React.FC = () => {
  const { viewer } = useViewer()

  if (viewer === null) {
    return (
      <div className={bookmarkNodeStyles.container}>
        <VStack>
          <header className={styles.header}>
            <Text as="p">
              Goodmarks is a community to share favorites with friends. No
              algorithm. No AI. 100% human.
            </Text>
          </header>
          <HStack alignment="leading">
            <Link href="/signup" passHref>
              <Button as="a" variant="primary">
                Sign up
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button as="a">Log in</Button>
            </Link>
          </HStack>
        </VStack>
      </div>
    )
  }

  return null
}

export default JoinGoodmarks
