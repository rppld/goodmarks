import { query as q } from 'faunadb'

const { CreateCollection, CreateIndex, Collection } = q
const COLLECTION_NAME = 'notifications'

async function createNotificationsCollection(client) {
  return await client.query(
    CreateCollection({
      name: COLLECTION_NAME,
    })
  )
}

async function createNotificationsByRecipientIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'notifications_by_recipient',
      source: Collection(COLLECTION_NAME),
      // We will search on recipient.
      terms: [
        {
          field: ['data', 'recipient'],
        },
      ],
      values: [
        {
          field: ['data', 'created'],
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

async function createNotificationsByRecipientAndReadStatusIndex(client) {
  return await client.query(
    CreateIndex({
      name: 'notifications_by_recipient_and_read_status',
      source: Collection(COLLECTION_NAME),
      // We will search on recipient and read status.
      terms: [
        {
          field: ['data', 'recipient'],
        },
        {
          field: ['data', 'read'],
        },
      ],
      values: [
        {
          field: ['data', 'created'],
        },
        {
          field: ['ref'],
        },
      ],
      serialized: true,
    })
  )
}

export {
  createNotificationsCollection,
  createNotificationsByRecipientIndex,
  createNotificationsByRecipientAndReadStatusIndex,
}
