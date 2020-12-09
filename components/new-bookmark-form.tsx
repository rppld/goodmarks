import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import parseHashtags from 'utils/parse-hashtags'
import { H4 } from './heading'
import * as Yup from 'yup'
import { Text, SmallText } from './text'
import MovieSearch from './movie-search'
import Input from './input'
import BookmarkNode from './bookmark-node'
import { useFormik } from 'formik'
import Button from './button'
import Layout from './layout'
import Form from './form'
import { VStack } from './stack'
import { useViewer } from './viewer-context'
import UnverifiedAccountDialog from 'components/unverified-account-dialog'
import { useRouter } from 'next/router'
import qs from 'querystringify'
interface Props {
  category: string
}

interface FormValues {
  text: string
  details: {
    title?: string
    url?: string
  }
}

const NewBookmarkForm: React.FC<Props> = ({ category }) => {
  const router = useRouter()
  const onboarding = qs.parse(router.asPath.split('?')[1]).onboarding ? true : false

  const textMaxLength = 140
  const { viewer } = useViewer()
  const [error, setError] = React.useState(null)
  const [selection, setSelection] = React.useState(null)
  const validationSchema = Yup.object({
    text: Yup.string()
      .min(3, 'Must be 3 characters or more')
      .max(textMaxLength, `Must be ${textMaxLength} characters or less`),
    details: Yup.object({
      title: Yup.string()
        .min(3, 'Must be 3 characters or more')
        .max(44, `Must be 44 characters or less`),
      url: Yup.string().min(3, 'Must be 3 characters or more'),
    }),
  })
  const initialValues: FormValues = {
    text: '',
    details: {},
  }
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: false,
  })

  function getHeading() {
    if (onboarding) {
      if (category === 'movie') return 'Your first bookmark will be a movie'
      if (category === 'tv-show') return 'Your first bookm ark will be a TV Show'
      if (category === 'link') return 'Your first bookmark will be a link'
      return ''
    } else {
      if (category === 'movie') return 'Bookmark a Movie'
      if (category === 'tv-show') return 'Bookmark a TV Show'
      if (category === 'link') return 'Bookmark a Link'
      return ''
    }
  }

  function getSubheading() {
    if (onboarding) {
      if (category === 'movie') return "Great choice! Now choose a movie and let people know why it's great."
      if (category === 'tv-show') return "Great choice! Now choose a TV Show and let people know why it's great."
      if (category === 'link') return "Great choice! Provide the link details and let people know why it's great."
      return ''
    } else {
      if (category === 'movie') return "Select the movie you want to bookmark and let people know why it's great."
      if (category === 'tv-show') return "Select the show you want to bookmark and let people know why it's great."
      if (category === 'link') return "Provide the link details."
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

      if(onboarding) {
        Router.push('/b/[id]', `/b/${data.id}?onboarding=true`)
      } else {
        Router.push('/b/[id]', `/b/${data.id}`)
      }
      
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
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            help={
              formik.errors.text && formik.touched.text
                ? String(formik.errors.text)
                : formik.values.text
                ? String(textMaxLength - formik.values.text.length)
                : String(textMaxLength)
            }
            validate={formik.errors.text ? () => false : undefined}
          />

          <VStack>
            <UnverifiedAccountDialog>
              {(show) => (
                <Button
                  variant="primary"
                  type={viewer.verified ? 'submit' : 'button'}
                  onClick={!viewer.verified ? show : undefined}
                  size="lg"
                  fullWidth
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Creating' : 'Create'}
                </Button>
              )}
            </UnverifiedAccountDialog>
            <SmallText as="div" meta>
              Bookmarks are public and can be viewed by anyone.
            </SmallText>
          </VStack>
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
            onBlur={formik.handleBlur}
            help={
              formik.errors.details &&
              formik.errors.details['title'] &&
              formik.touched.details &&
              formik.touched.details['title']
                ? formik.errors.details['title'] &&
                  String(formik.errors.details['title'])
                : undefined
            }
            validate={
              formik.errors.details && formik.errors.details['title']
                ? () => false
                : undefined
            }
          />

          <Input
            name="details.url"
            labelText="URL"
            placeholder="https://"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            help={
              formik.errors.details &&
              formik.errors.details['url'] &&
              formik.touched.details &&
              formik.touched.details['url']
                ? formik.errors.details['url'] &&
                  String(formik.errors.details['url'])
                : undefined
            }
            validate={
              formik.errors.details && formik.errors.details['url']
                ? () => false
                : undefined
            }
          />

          <Input
            as="textarea"
            rows="4"
            name="text"
            labelText="Why should people check this out?"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            help={
              formik.errors.text && formik.touched.text
                ? String(formik.errors.text)
                : formik.values.text
                ? String(textMaxLength - formik.values.text.length)
                : String(textMaxLength)
            }
            validate={formik.errors.text ? () => false : undefined}
          />

          <VStack>
            <UnverifiedAccountDialog>
              {(show) => (
                <Button
                  type={viewer.verified ? 'submit' : 'button'}
                  onClick={!viewer.verified ? show : undefined}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Creating' : 'Create'}
                </Button>
              )}
            </UnverifiedAccountDialog>
            <SmallText as="div" meta>
              Bookmarks are public and can be viewed by anyone.
            </SmallText>
          </VStack>

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
