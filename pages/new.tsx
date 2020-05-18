import React from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import qs from 'querystringify'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import Layout from 'components/layout'
import CategorySelection from 'components/category-selection'
import Button from 'components/button'
import Header from 'components/header'
import PageTitle from 'components/page-title'
import { H2 } from 'components/heading'
import { HStack } from 'components/stack'
import { Home } from 'components/icon'
import Text from 'components/text'
import useInterval from 'utils/use-interval'

const New: NextPage = () => {
  const router = useRouter()
  const queryString = router && router.asPath.split('?')[1]
  const query = queryString && qs.parse(queryString)
  const onboarding = query?.onboarding === 'true'
  const [count, setCount] = React.useState(5)
  const [delay] = React.useState(1000)
  const [isRunning, setIsRunning] = React.useState(true)

  function handleInterval() {
    count === 0 ? setIsRunning(false) : setCount(count - 1)
  }

  useInterval(handleInterval, isRunning ? delay : null)

  function getTitle() {
    if (onboarding) return 'Done!'
    return 'New bookmark'
  }

  function getDescription() {
    if (onboarding) {
      return [
        'You successfully created an account.',
        'Now go ahead and add your first bookmark.',
      ].join(' ')
    }
    return 'Choose a category.'
  }

  return (
    <Layout
      header={
        <Header>
          {onboarding ? (
            <HStack alignment="trailing">
              <Link href="/" passHref>
                <Button
                  as="a"
                  variant="danger"
                  disabled={count === 0 ? false : true}
                >
                  {count === 0 ? 'Skip' : `Skip (${count})`}
                </Button>
              </Link>
            </HStack>
          ) : (
            <HStack alignment="space-between">
              <Link href="/" passHref>
                <Button as="a" variant="generic" leftAdornment={<Home />} />
              </Link>
              <Link href="/" passHref>
                <Button as="a" variant="danger">
                  Cancel
                </Button>
              </Link>
            </HStack>
          )}
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">{getTitle()}</H2>
        <Text meta>{getDescription()}</Text>
      </PageTitle>

      <CategorySelection />
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(New)
