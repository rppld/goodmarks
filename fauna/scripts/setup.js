import faunadb from 'faunadb'
import { setupDatabase } from '../setup'

const main = async () => {
  const secret = process.env.FAUNA_ADMIN_KEY
  const client = new faunadb.Client({ secret })

  try {
    await setupDatabase(client)
  } catch (err) {
    console.error('Unexpected error', err)
  }
}

main()
