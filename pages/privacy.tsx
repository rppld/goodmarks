import React from 'react'
import { NextPage, GetStaticProps } from 'next'
import Layout from 'components/layout'
import { H4 } from 'components/heading'
import PageTitle from 'components/page-title'
import MarkdownOutput from 'components/markdown-output'
import { getResource } from 'lib/storyblok'
import { Story } from 'lib/types'
import createMarkup from 'utils/create-markup'

interface Props {
  page: Story
}

const Privacy: NextPage<Props> = ({ page }) => {
  return (
    <Layout title="Privacy">
      <PageTitle>
        <H4 as="h1">{page?.name}</H4>
      </PageTitle>

      {page?.content?.body ? (
        <MarkdownOutput
          dangerouslySetInnerHTML={createMarkup(page.content.body)}
        />
      ) : null}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { story } = await getResource({ slug: 'privacy' })

  return {
    props: {
      page: story,
    },
  }
}

export default Privacy
