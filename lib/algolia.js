import algoliaSearch from 'algoliasearch/lite'

const appId = 'PDWUZKQ8PS'
const searchApiKey = '05bad2e00db0bb8778eec29852c5176f'
const indexName = 'dev_USERS'
const client = algoliaSearch(appId, searchApiKey)
const index = client.initIndex(indexName)

export default index
