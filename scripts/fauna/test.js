const faunadb = require('faunadb')
const q = faunadb.query

async function createIndexCoolAccounts(client) {
  client.query(
    q.CreateIndex({
      name: 'cool_accounts',
      source: q.Collection('Accounts'),
      // this is the default collection index, no terms or values are provided
      // which means the index will sort by reference and return only the reference.
      serialized: true,
    })
  )
}

module.exports = { createIndexCoolAccounts }
