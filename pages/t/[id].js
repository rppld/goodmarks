import React from 'react'
import useSWR from 'swr'
import fetch from '../../lib/fetch'
import Layout from '../../components/layout'
import { useRouter } from 'next/router'

const Tip = () => {
  const router = useRouter()
  const { id } = router.query
  // Need to pass a function to see when `id` is ready. Check is
  // required because `useRouter` needs a few ms to be initialized.
  const { data, error } = useSWR(() => id && `/api/tips?id=${id}`, fetch)

  return (
    <Layout>
      <h1>Tip</h1>
      {error && <div>failed to load</div>}
      {!data ? <div>loading...</div> : <div>{data.tips[0].title}</div>}
    </Layout>
  )
}

export default Tip
