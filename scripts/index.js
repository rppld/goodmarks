require('dotenv').config()
const faunadb = require('faunadb')
const { query } = require('./fauna')

async function main() {
  const secret = process.env.FAUNA_SERVER_KEY
  const client = new faunadb.Client({ secret })

  try {
    await query(client)
  } catch (error) {
    console.error('Unexpected error', error)
  }
}

main()
