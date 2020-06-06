import React from 'react'
import { NextPage } from 'next'
import MovieHeader from 'components/movie-header'
import Layout from 'components/layout'
import { useRouter } from 'next/router'
import Button from 'components/button'
import { HStack } from 'components/stack'
import { useViewer } from 'components/viewer-context'
import useDeleteBookmark from 'utils/use-delete-bookmark'

const Bookmark: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const error = false
  const data = true
  const { viewer } = useViewer()
  const [deleteBookmark, { loading: deleting }] = useDeleteBookmark()

  async function handleBookmark() {
    console.log('bookmarking')
  }

  return (
    <Layout>
      {error && <div>failed to load</div>}

      {!data ? (
        <div>loading...</div>
      ) : (
        <MovieHeader
          title={'Breaking Bad'}
          releaseDate={'2008'}
          posterPath={'ggFHVNu6YYI5L9pCfOacjizRGt.jpg'}
          backdropPath={'tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg'}
        >
          {/* TODO: add functionality to buttons */}
          {viewer && (
            <HStack>
              <Button variant="primary" fullWidth onClick={handleBookmark}>
                Bookmark
              </Button>
              <Button fullWidth>Add to list</Button>
            </HStack>
          )}
        </MovieHeader>
      )}

      {viewer && <></>}
    </Layout>
  )
}

export default Bookmark
