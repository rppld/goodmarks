import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import parseHashtags from 'utils/parse-hashtags'
import { H4 } from './heading'
import * as Yup from 'yup'
import { Text } from './text'
import MovieSearch from './movie-search'
import Input from './input'
import BookmarkNode from './bookmark-node'
import { useFormik } from 'formik'
import Button from './button'
import Layout from './layout'
import Form from './form'
import { HStack } from './stack'
import { useViewer } from './viewer-context'

interface Props {
  category: string
}

const NewBookmarkForm: React.FC<Props> = ({ category }) => {
  const textMaxLength = 140
  const { viewer } = useViewer()
  const [error, setError] = React.useState(null)
  const [selection, setSelection] = React.useState(null)
  const validationSchema = Yup.object({
    text: Yup.string()
      .min(3, 'Must be 3 characters or more')
      .max(textMaxLength, `Must be ${textMaxLength} characters or less`),
  })
  const formik = useFormik({
    initialValues: {
      text: '',
      details: {},
    },
    validationSchema,
    onSubmit: handleSubmit,
  })

  function getHeading() {
    if (category === 'movie') return 'Bookmark a Movie'
    if (category === 'tv-show') return 'Bookmark a TV Show'
    if (category === 'link') return 'Bookmark a Link'
    return ''
  }

  function getSubheading() {
    switch (category) {
      case 'movie':
        return "Select the movie you want to bookmark and let people know why it's great."
      case 'tv-show':
        return "Select the show you want to bookmark and let people know why it's great."
      case 'link':
        return 'Provide the link details.'
      default:
        return ''
    }
  }

  function getMockedBookmarkProps(details) {
    return {
      category: {
        id: 'category',
        name: category,
        slug: `${category}s`,
      },
      bookmarkStats: {
        id: 'stats',
        comment: false,
        like: false,
        repost: false,
        user: {},
        bookmark: {},
      },
      comments: [],
      author: viewer,
      bookmark: {
        id: 'new',
        created: 'just now',
        text: formik.values.text || '...',
        comments: 0,
        likes: 0,
        reposts: 0,
        details: {
          ...details,
        },
      },
    }
  }

  async function handleSubmit(values) {
    setError(null)
    formik.setSubmitting(true)

    try {
      const response = await fetch('/api/bookmarks?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: values.text,
          category: `${category}s`, // Plural, e.g. "links" or "tv-shows".
          details: selection ? selection : values.details,
          hashtags: parseHashtags(values.text),
        }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      Router.push('/b/[id]', `/b/${data.id}`)
    } catch (error) {
      console.error(error)
      formik.setSubmitting(false)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <PageTitle>
        <H4 as="h1">{getHeading()}</H4>
        <Text meta>{getSubheading()}</Text>
      </PageTitle>

      {selection ? (
        <Form onSubmit={formik.handleSubmit}>
          <BookmarkNode preview {...getMockedBookmarkProps(selection)} />

          <Input
            labelText="Why should people check this out?"
            name="text"
            placeholder="Lives up to the hype!"
            as="textarea"
            rows="4"
            help={
              formik.values.text
                ? String(textMaxLength - formik.values.text.length)
                : String(textMaxLength)
            }
            onChange={formik.handleChange}
          />

          <HStack alignment="trailing">
            <Button
              variant="primary"
              type="submit"
              size="lg"
              fullWidth
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Creating bookmark' : 'Create bookmark'}
            </Button>
          </HStack>
        </Form>
      ) : category === 'link' ? (
        <Form onSubmit={formik.handleSubmit}>
          <BookmarkNode
            preview
            {...getMockedBookmarkProps(formik.values.details)}
          />

          <Input
            name="details.title"
            labelText="Title"
            onChange={formik.handleChange}
          />

          <Input
            name="details.url"
            labelText="URL"
            placeholder="https://"
            onChange={formik.handleChange}
          />

          <Input
            as="textarea"
            rows="4"
            name="text"
            labelText="Why should people check this out?"
            onChange={formik.handleChange}
            help={
              formik.values.text
                ? String(textMaxLength - formik.values.text.length)
                : String(textMaxLength)
            }
          />

          <HStack alignment="trailing">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Creating bookmark' : 'Create bookmark'}
            </Button>
          </HStack>

          {error && <p>Error: {error}</p>}
        </Form>
      ) : (
        <MovieSearch
          onSelect={setSelection}
          label={
            category === 'movie' ? 'Search for movies' : 'Search for TV shows'
          }
          placeholder={category === 'movie' ? 'The Gentlemen' : 'The Sopranos'}
          context={category === 'movie' ? 'movie' : 'tv'}
        />
      )}
    </Layout>
  )
}

export default NewBookmarkForm
