import { handleSetupError } from '../helpers/errors'
import { createAccountVerificationRequestsCollection } from './account-verification-requests'
import {
  createAccountsCollection,
  createAllAccountsIndex,
  createAccountsByEmailIndex,
  createTokensByInstanceIndex,
} from './accounts'
import {
  createBookmarksCollection,
  createAllBookmarksIndex,
  createBookmarksByAuthorIndex,
  createBookmarksByHashtagIndex,
  createBookmarksByRankingIndex,
  createBookmarksByReferenceIndex,
} from './bookmarks'
import {
  createBookmarkStatsCollection,
  createBookmarkStatsByBookmarkIndex,
  createBookmarkStatsByUserAndBookmarkIndex,
} from './bookmark-stats'
import {
  createCategoriesCollection,
  createCategoriesBySlugIndex,
} from './categories'
import {
  createCommentsCollection,
  createCommentsByObjectAndAuthorOrdered,
  createCommentsByObjectOrdered,
} from './comments'
import {
  createFollowerStatsCollection,
  createFollowerStatsByAuthorAndFollowerIndex,
  createFollowerStatsByUserPopularity,
} from './follower-stats'
import { createHashtagsAndUsersByWordpartsIndex } from './search'
import { createHashtagsCollection, createHashtagsByNameIndex } from './hashtags'
import {
  createListItemsCollection,
  createListItemsByListIndex,
  createListItemsByListAndObjectIndex,
} from './list-items'
import {
  createListStatsCollection,
  createListStatsByListIndex,
  createListStatsByUserAndListIndex,
} from './list-stats'
import {
  createListsCollection,
  createListsByAuthorIndex,
  createListsByAuthorAndPrivateIndex,
  createListsByReferenceIndex,
} from './lists'
import {
  createNotificationsCollection,
  createNotificationsByRecipientIndex,
  createNotificationsByRecipientAndReadStatusIndex,
} from './notifications'
import {
  createPasswordResetRequestsCollection,
  createPasswordResetRequestsByAccountIndex,
} from './password-reset-requests'
import {
  createUsersCollection,
  createUsersByAccountIndex,
  createUsersByHandleIndex,
} from './users'
import {
  createLoggedInRole,
  createPasswordResetRequestRole,
  createAccountVerificationRole,
} from './roles'

async function setupDatabase(client) {
  await handleSetupError(
    createAccountsCollection(client),
    'Collection: accounts'
  )
  await handleSetupError(
    createAccountVerificationRequestsCollection(client),
    'Collection: account_verification_requests'
  )
  await handleSetupError(
    createBookmarkStatsCollection(client),
    'Collection: bookmarks_stats'
  )
  await handleSetupError(
    createBookmarksCollection(client),
    'Collection: bookmarks'
  )
  await handleSetupError(
    createCategoriesCollection(client),
    'Collection: categories'
  )
  await handleSetupError(
    createCommentsCollection(client),
    'Collection: comments'
  )
  await handleSetupError(
    createFollowerStatsCollection(client),
    'Collection: follower_stats'
  )
  await handleSetupError(
    createHashtagsCollection(client),
    'Collection: hashtags'
  )
  await handleSetupError(
    createListItemsCollection(client),
    'Collection: list_items'
  )
  await handleSetupError(
    createListStatsCollection(client),
    'Collection: list_stats'
  )
  await handleSetupError(createListsCollection(client), 'Collection: lists')
  await handleSetupError(
    createNotificationsCollection(client),
    'Collection: notifications'
  )
  await handleSetupError(
    createPasswordResetRequestsCollection(client),
    'Collection: password_reset_requests'
  )
  await handleSetupError(createUsersCollection(client), 'Collection: users')
  await handleSetupError(createAllAccountsIndex(client), 'Index: all_accounts')
  await handleSetupError(
    createAccountsByEmailIndex(client),
    'Index: accounts_by_email'
  )
  await handleSetupError(
    createTokensByInstanceIndex(client),
    'Index: tokens_by_instance'
  )
  await handleSetupError(
    createAllBookmarksIndex(client),
    'Index: all_bookmarks'
  )
  await handleSetupError(
    createBookmarksByAuthorIndex(client),
    'Index: bookmarks_by_author'
  )
  await handleSetupError(
    createBookmarksByHashtagIndex(client),
    'Index: bookmarks_by_hashtag'
  )
  await handleSetupError(
    createBookmarksByRankingIndex(client),
    'Index: bookmarks_by_ranking'
  )
  await handleSetupError(
    createBookmarksByReferenceIndex(client),
    'Index: bookmarks_by_reference'
  )
  await handleSetupError(
    createBookmarkStatsByBookmarkIndex(client),
    'Index: bookmarks_stats_by_bookmark'
  )
  await handleSetupError(
    createBookmarkStatsByUserAndBookmarkIndex(client),
    'Index: bookmarks_stats_by_user_and_bookmark'
  )
  await handleSetupError(
    createCategoriesBySlugIndex(client),
    'Index: categories_by_slug'
  )
  await handleSetupError(
    createCommentsByObjectAndAuthorOrdered(client),
    'Index: comments_by_object_and_author_ordered'
  )
  await handleSetupError(
    createCommentsByObjectOrdered(client),
    'Index: comments_by_object_ordered'
  )
  await handleSetupError(
    createFollowerStatsByAuthorAndFollowerIndex(client),
    'Index: follower_stats_by_author_and_follower'
  )
  await handleSetupError(
    createFollowerStatsByUserPopularity(client),
    'Index: follower_stats_by_user_popularity'
  )
  await handleSetupError(
    createHashtagsAndUsersByWordpartsIndex(client),
    'Index: hashtags_and_users_by_wordparts'
  )
  await handleSetupError(
    createHashtagsByNameIndex(client),
    'Index: hashtags_by_name'
  )
  await handleSetupError(
    createListItemsByListIndex(client),
    'Index: list_items_by_list'
  )
  await handleSetupError(
    createListItemsByListAndObjectIndex(client),
    'Index: list_items_by_list_and_object'
  )
  await handleSetupError(
    createListStatsByListIndex(client),
    'Index: list_stats_by_list'
  )
  await handleSetupError(
    createListStatsByUserAndListIndex(client),
    'Index: list_stats_by_user_and_list'
  )
  await handleSetupError(
    createListsByAuthorIndex(client),
    'Index: list_by_author'
  )
  await handleSetupError(
    createListsByAuthorAndPrivateIndex(client),
    'Index: list_by_author_and_private'
  )
  await handleSetupError(
    createListsByReferenceIndex(client),
    'Index: list_by_reference'
  )
  await handleSetupError(
    createNotificationsByRecipientIndex(client),
    'Index: notifications_by_recipient'
  )
  await handleSetupError(
    createNotificationsByRecipientAndReadStatusIndex(client),
    'Index: notifications_by_recipient_and_read_status'
  )
  await handleSetupError(
    createPasswordResetRequestsByAccountIndex(client),
    'Index: password_reset_requests_by_account'
  )
  await handleSetupError(
    createUsersByAccountIndex(client),
    'Index: users_by_account'
  )
  await handleSetupError(
    createUsersByHandleIndex(client),
    'Index: users_by_handle'
  )
  await handleSetupError(
    createLoggedInRole(client),
    'Role: membershiprole_loggedin'
  )
  await handleSetupError(
    createPasswordResetRequestRole(client),
    'Role: membershiprole_passwordreset'
  )
  await handleSetupError(
    createAccountVerificationRole(client),
    'Role: membershiprole_verification'
  )
}

export { setupDatabase }
