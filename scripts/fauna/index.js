require('dotenv').config()
const faunadb = require('faunadb')
const { createSearchIndexes, cool } = require('./searching')

async function main() {
  const secret = process.env.FAUNA_SERVER_KEY
  const client = new faunadb.Client({ secret })

  try {
    await cool(client)
  } catch (err) {
    console.error('Unexpected error', err)
  }
}

main()