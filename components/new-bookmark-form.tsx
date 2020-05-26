import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import { useRouter } from 'next/router'
import qs from 'querystringify'
import parseHashtags from 'utils/parse-hashtags'
import { H2 } from './heading'
import { Text } from './text'
import MovieSearch from './movie-search'
import Input from './input'
import Item from './item'
import { useFormik } from 'formik'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import Link from 'next/link'
import Button from './button'
import Layout from './layout'
import Header from './header'
import Form from './form'
import { HStack } from './stack'
import { ChevronLeft } from './icon'

interface Props {
  category: string
}

const NewBookmarkForm: React.FC<Props> = ({ category }) => {
  const router = useRouter()
  const queryString = router && router.asPath.split('?')[1]
  const query = queryString && qs.parse(queryString)
  const onboarding = query?.onboarding === 'true'

  const [error, setError] = React.useState(null)
  const [selection, setSelection] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      details: {},
    },
    onSubmit: handleSubmit,
  })

  function resetSelection() {
    return setSelection(null)
  }

  function getHeading() {
    if (selection) return 'Description'
    if (category === 'movie') return 'Movie'
    if (category === 'tv-show') return 'TV show'
    if (category === 'link') return 'Link'
    return ''
  }

  function getBackButtonLabel() {
    if (selection) {
      switch (category) {
        case 'movie':
          return 'Movie'
        case 'tv-show':
          return 'TV show'
        default:
          return ''
      }
    }
    return 'New bookmark'
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
          title: selection ? selection.name || selection.title : values.title,
          category: `${category}s`, // Plural, e.g. "links" or "tv-shows".
          description: values.description,
          details: selection ? selection : values.details,
          hashtags: parseHashtags(values.description) || [],
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
    <Layout
      header={
        <Header>
          <HStack
            alignment={onboarding && !selection ? 'trailing' : 'space-between'}
          >
            {selection ? (
              <Button onClick={resetSelection} leftAdornment={<ChevronLeft />}>
                {getBackButtonLabel()}
              </Button>
            ) : onboarding ? null : (
              <Link href="/new" passHref>
                <Button as="a" leftAdornment={<ChevronLeft />}>
                  New bookmark
                </Button>
              </Link>
            )}

            <Link href="/" passHref>
              <Button as="a" variant="danger">
                Cancel
              </Button>
            </Link>
          </HStack>
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">{getHeading()}</H2>
        <Text meta>{getSubheading()}</Text>
      </PageTitle>

      {selection ? (
        <Form onSubmit={formik.handleSubmit}>
          <Item
            title={selection.name || selection.title}
            image={`https://image.tmdb.org/t/p/w220_and_h330_face/${selection['poster_path']}`}
            alt={`Poster for ${selection.name || selection.title}`}
            text={getYear(
              parseISO(selection['first_air_date'] || selection['release_date'])
            )}
          />

          <Input
            labelText="Description"
            hideLabel
            name="description"
            placeholder="Lives up to the hype"
            as="textarea"
            rows="6"
            onChange={formik.handleChange}
          />

          <HStack alignment="trailing">
            <Button variant="primary" type="submit">
              {formik.values.description.length > 0 ? 'Save' : 'Skip for now'}
            </Button>
          </HStack>
        </Form>
      ) : category === 'link' ? (
        <Form onSubmit={formik.handleSubmit}>
          <Input
            name="title"
            labelText="Title"
            onChange={formik.handleChange}
          />

          <Input
            as="textarea"
            rows="6"
            name="description"
            labelText="Description"
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
