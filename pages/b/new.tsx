import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import qs from 'querystringify'
import { withAuthSync } from 'lib/auth'
import getViewerOrRedirect from 'utils/get-viewer-or-redirect'
import Layout from 'components/layout'
import Button from 'components/button'
import CategorySelection from 'components/category-selection'
import PageTitle from 'components/page-title'
import { H4 } from 'components/heading'
import { Text } from 'components/text'
import useInterval from 'utils/use-interval'
import { VStack } from 'components/stack'

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
    if (onboarding) return 'Create your first bookmark'
    return 'New Bookmark'
  }

  function getDescription() {
    if (onboarding) {
      return [
        'You successfully created an account.',
        'Now go ahead and add your first bookmark.',
      ].join(' ')
    }
    return 'Choose a category for your bookmark.'
  }

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">{getTitle()}</H4>
        <Text meta>{getDescription()}</Text>
      </PageTitle>

      <VStack spacing="md">
        <CategorySelection />

        {onboarding && count === 0 ? (
          <Link href="/" passHref>
            <Button as="a" fullWidth size="lg">
              Skip
            </Button>
          </Link>
        ) : (
          <Button fullWidth size="lg" disabled={true}>
            Skip ({count})
          </Button>
        )}
      </VStack>
    </Layout>
  )
}

New.getInitialProps = async (ctx) => {
  const viewer = await getViewerOrRedirect(ctx)
  return { viewer }
}

export default withAuthSync(New)
