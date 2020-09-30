import React from 'react'
import Link from 'next/link'
import Dialog, { DialogProps } from './dialog'
import { VStack } from './stack'
import { H3 } from './heading'
import { Text } from './text'

interface Props extends DialogProps {
  children: (show: () => void) => React.ReactElement
}

const UnverifiedAccountDialog: React.FC<Props> = ({ children }) => {
  const [show, setShow] = React.useState(false)
  const open = () => setShow(true)
  const close = () => setShow(false)

  return (
    <>
      {children(open)}
      <Dialog isOpen={show} onDismiss={close} a11yTitle="Activate your account">
        <VStack spacing="sm">
          <H3 as="h1">Activate your account</H3>
          <Text meta as="p">
            To perform this action, please verify your account first. You’ve
            received a verification-link via email after signing up. In case you
            can’t find the email, please check your spam-folder or{' '}
            <Link href="/contact">contact us</Link> and we’re happy to help.
          </Text>
        </VStack>
      </Dialog>
    </>
  )
}

export default UnverifiedAccountDialog
