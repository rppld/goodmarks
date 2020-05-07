import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import parseHashtags from '../lib/parse-hashtags'
import { H2 } from './heading'
import Text from './text'
import MovieSearch from './movie-search'
import Input from './input'
import Image from './image'
import { useFormik } from 'formik'
import { H4 } from './heading'
import styles from './new-bookmark-form.module.css'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import Link from 'next/link'
import Button from './button'
import Layout from './layout'
import Header from './header'
import Form from './form'
import { MenuBar, MenuBarNav, MenuBarNavItem } from './menu-bar'
import { ChevronLeft } from './icon'

const NewBookmarkForm = ({ category }) => {
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

  function getTitleKey() {
    if (category === 'tv-show') return 'name'
    return 'title'
  }

  function getDateKey() {
    if (category === 'tv-show') return 'first_air_date'
    return 'release_date'
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
          title: selection ? selection[getTitleKey()] : values.title,
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
          <MenuBar>
            <MenuBarNav>
              <MenuBarNavItem>
                {selection ? (
                  <Button
                    onClick={resetSelection}
                    leftAdornment={<ChevronLeft />}
                  >
                    {getBackButtonLabel()}
                  </Button>
                ) : (
                  <Link href="/new" passHref>
                    <Button as="a" leftAdornment={<ChevronLeft />}>
                      New bookmark
                    </Button>
                  </Link>
                )}
              </MenuBarNavItem>
            </MenuBarNav>
            <MenuBarNav>
              <MenuBarNavItem>
                <Link href="/" passHref>
                  <Button as="a" variant="danger">
                    Cancel
                  </Button>
                </Link>
              </MenuBarNavItem>
            </MenuBarNav>
          </MenuBar>
        </Header>
      }
    >
      <PageTitle>
        <H2 as="h1">{getHeading()}</H2>
        <Text meta>{getSubheading()}</Text>
      </PageTitle>

      {selection ? (
        <Form onSubmit={formik.handleSubmit}>
          <span className={styles.selection}>
            <Image
              src={`https://image.tmdb.org/t/p/w220_and_h330_face/${selection['poster_path']}`}
              alt={`Poster for ${selection[getTitleKey()]}`}
              className={styles.poster}
            />
            <span>
              <H4>{selection[getTitleKey()]}</H4>
              <Text meta>{getYear(parseISO(selection[getDateKey()]))}</Text>
            </span>
          </span>

          <Input
            labelText="Description"
            hideLabel
            name="description"
            placeholder="Lives up to the hype"
            as="textarea"
            rows="6"
            value={formik.values.description}
            onChange={formik.handleChange}
          />

          <MenuBar>
            <Button variant="primary" type="submit">
              {formik.values.description.length > 0 ? 'Save' : 'Skip for now'}
            </Button>
          </MenuBar>
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

          <MenuBar>
            <Button type="submit" variant="primary">
              Add bookmark
            </Button>
          </MenuBar>

          {error && <p>Error: {error}</p>}
        </Form>
      ) : (
        <MovieSearch
          onSelect={setSelection}
          label={getHeading()}
          placeholder={category === 'movie' ? 'The Gentlemen' : 'The Sopranos'}
          searchContext={category === 'movie' ? 'movie' : 'tv'}
        />
      )}
    </Layout>
  )
}

export default NewBookmarkForm
