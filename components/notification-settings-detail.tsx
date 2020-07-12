import React from 'react'
import { VStack, HStack } from './stack'
import Button from './button'
import Checkbox from './checkbox'
import { H5 } from './heading'

const NotificationSettingsDetail: React.FC = () => {
  return (
    <>
      <VStack spacing="md">
        <VStack>
          <H5>Notification types</H5>
          <Checkbox
            name="global"
            labelText="Email notifications"
            help="Disable this if you don't want to receive any emails."
            checked={true}
          />
          <Checkbox
            name="global"
            labelText="Push notifications"
            help="Disable this if you don't want to receive any emails."
            checked={true}
          />
        </VStack>

        <VStack>
          <H5>New comments</H5>
          <Checkbox
            name="comment-on-user-bookmark"
            labelText="My bookmarks"
            help="When you have a new comment on one of your bookmarks."
            checked={true}
          />
          <Checkbox
            name="new-comment"
            labelText="My lists"
            help="When someone comments on one of your lists."
            checked={true}
          />
          <Checkbox
            name="new-comment"
            labelText="Bookmarks you commented on"
            help="When someone comments on the same bookmark as you."
            checked={true}
          />
        </VStack>

        <VStack>
          <H5>New likes</H5>
          <Checkbox
            name="new-like"
            labelText="My bookmarks"
            help="When someone likes one of your bookmarks."
            checked={true}
          />
          <Checkbox
            name="new-like"
            labelText="My lists"
            help="When someone likes one of your lists."
            checked={true}
          />
          <Checkbox
            name="new-like"
            labelText="My comments"
            help="When someone likes your comment."
            checked={true}
          />
        </VStack>

        <VStack>
          <H5>Followers</H5>
          <Checkbox
            name="new-like"
            labelText="New follower"
            help="When someone started following you."
            checked={true}
          />
        </VStack>

        <footer>
          <HStack alignment="trailing">
            <Button type="submit" variant="primary" disabled={false}>
              Save changes
            </Button>
          </HStack>
        </footer>
      </VStack>
    </>
  )
}

export default NotificationSettingsDetail
