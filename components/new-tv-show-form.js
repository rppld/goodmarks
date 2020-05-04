import React from 'react'
import Router from 'next/router'
import PageTitle from './page-title'
import { H2 } from './heading'
import Text from './text'
import MovieSearch from './movie-search'
import Input from './input'
import Image from './image'
import { useFormik } from 'formik'
import { H4 } from './heading'
import styles from './new-movie-form.module.css'
import getYear from 'date-fns/getYear'
import parseISO from 'date-fns/parseISO'
import Link from 'next/link'
import Button from './button'
import Layout from './layout'
import Header from './header'
import Form from './form'
import { MenuBar, MenuBarNav, MenuBarNavItem } from './menu-bar'
import { ChevronLeft } from './icon'

const NewTVShowForm = () => {
  const [selection, setSelection] = React.useState(null)
  const formik = useFormik({
    initialValues: {
      description: '',
    },
    onSubmit: handleSubmit,
  })

  function resetSelection() {
    return setSelection(null)
  }

  async function handleSubmit(values) {
    try {
      const { title, ...details } = selection
      const response = await fetch('/api/bookmarks?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: 'tv-shows',
          description: values.description,
          details,
        }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      Router.push(`/b/${data.id}`)
    } catch (error) {
      console.error(error)
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
                    Movie
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
        <H2 as="h1">{selection ? 'Description' : 'TV show'}</H2>
        <Text meta>
          {selection
            ? 'What did you like about this show?'
            : 'Select the movie you want to bookmark.'}
        </Text>
      </PageTitle>

      {selection ? (
        <Form onSubmit={formik.handleSubmit}>
          <span className={styles.movie}>
            <Image
              src={`https://image.tmdb.org/t/p/w220_and_h330_face/${selection['poster_path']}`}
              alt={`Poster for ${selection.title}`}
              className={styles.image}
            />
            <span>
              <H4>{selection.title}</H4>
              <Text meta>{getYear(parseISO(selection['release_date']))}</Text>
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
      ) : (
        <MovieSearch
          onSelect={setSelection}
          label="TV shows"
          placeholder="The Sopranos"
          searchContext="tv"
        />
      )}
    </Layout>
  )
}

export default NewTVShowForm
