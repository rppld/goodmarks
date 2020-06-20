import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import parseHashtags from 'utils/parse-hashtags'
import { H4 } from './heading'
import { Text } from './text'
import MovieSearch from './movie-search'
import Input from './input'
import Embed from './bookmark-node/embed'
import { useFormik } from 'formik'
import Button from './button'
import Layout from './layout'
import Form from './form'
import { HStack } from './stack'

interface Props {
  category: string
}

const NewBookmarkForm: React.FC<Props> = ({ category }) => {
  const [error, setError] = React.useState(null)
  const [selection, setSelection] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      text: '',
      details: {},
    },
    onSubmit: handleSubmit,
  })

  React.useEffect(() => {
    console.log(parseHashtags(formik.values.text))
  }, [formik.values.text])

  function resetSelection() {
    return setSelection(null)
  }

  function getHeading() {
    if (selection) return 'Description'
    if (category === 'movie') return 'Bookmark a Movie'
    if (category === 'tv-show') return 'Bookmark a TV Show'
    if (category === 'link') return 'Bookmark a Link'
    return ''
  }

  function getSubheading() {
    if (selection) {
      switch (category) {
        case 'movie':
          return 'What did you like about this movie?'
        case 'tv-show':
          return 'What did you like about this TV show?'
        default:
          return ''
      }
    }
    switch (category) {
      case 'movie':
        return 'Select the movie you want to bookmark.'
      case 'tv-show':
        return 'Select the show you want to bookmark.'
      case 'link':
        return 'Provide the link details.'
      default:
        return ''
    }
  }

  async function handleSubmit(values) {
    setError(null)

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
      Router.push(`/b/${data.id}`)
    } catch (error) {
      console.error(error)
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
          <Embed
            as="span"
            bookmark={{
              id: 'new',
              created: 'new',
              text: 'new',
              comments: 0,
              likes: 0,
              reposts: 0,
              details: {
                ...selection,
              },
            }}
          />

          <Input
            labelText="Text"
            hideLabel
            name="text"
            placeholder="Lives up to the hype"
            as="textarea"
            rows="6"
            onChange={formik.handleChange}
          />

          <HStack alignment="trailing">
            <Button variant="primary" type="submit">
              {formik.values.text.length > 0 ? 'Save' : 'Skip for now'}
            </Button>
          </HStack>
        </Form>
      ) : category === 'link' ? (
        <Form onSubmit={formik.handleSubmit}>
          <Input
            as="textarea"
            rows="6"
            name="text"
            labelText="Text"
            onChange={formik.handleChange}
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

          <HStack alignment="trailing">
            <Button type="submit" variant="primary">
              Add bookmark
            </Button>
          </HStack>

          {error && <p>Error: {error}</p>}
        </Form>
      ) : (
        <MovieSearch
          onSelect={setSelection}
          label={getHeading()}
          placeholder={category === 'movie' ? 'The Gentlemen' : 'The Sopranos'}
          context={category === 'movie' ? 'movie' : 'tv'}
        />
      )}
    </Layout>
  )
}

export default NewBookmarkForm
