export interface Account {
  email: string
  user: any
  verified: boolean
}

export interface Bookmark {
  id: string
  created: any
  text: string
  comments: number
  likes: number
  reposts: number
  details: any
}

export interface BookmarkCategory {
  id: string
  name: string
  slug: String
}

export interface CommentNode {
  comment: Comment
  author: User
}

export interface Comment {
  id: string
  text: string
  created: any
}

type NotificationType = 'NEW_COMMENT' | 'NEW_LIKE' | 'NEW_FOLLOW'
type NotificationObjectType = 'BOOKMARK' | 'LIST' | 'USER'

export interface Notification {
  id: string
  type: NotificationType
  sender: any
  recipient: any
  object: any
  objectType: NotificationObjectType
  created: any
  read: boolean
}

export interface NotificationEdge {
  id: string
  type: NotificationType
  senderHandle: any
  objectId: string
  objectType: NotificationObjectType
  text: string
  read: boolean
}

export interface NotificationsData {
  edges: {
    notification: Notification
  }[]
}

export interface User {
  id: string
  handle: string
  picture: string
  bio: string
  name: string
}

export interface BookmarkStats {
  id: string
  comment: boolean
  like: boolean
  repost: boolean
  user: any
  bookmark: any
}

export interface ListStats {
  id: string
  comment: boolean
  like: boolean
  repost: boolean
  user: any
  list: any
}

export interface BookmarkNode {
  author: User
  category: BookmarkCategory
  original: any
  bookmark: Bookmark
  bookmarkStats: BookmarkStats
  comments: CommentNode[]
}

export interface BookmarksData {
  edges: BookmarkNode[]
}

export interface Hashtag {
  name: string
}

export interface List {
  id: string
  name: string
  description: string
  private: boolean
  likes: number
  comments: number
  reposts: number
  hashtags: Hashtag[]
  author: any
  created: any
  ts: any
}

export interface ListItem {
  id: string
  bookmark: BookmarkNode
}

export interface ListsData {
  edges: {
    list: List
    listStats: ListStats
    author: User
    comments: CommentNode[]
  }[]
}

export interface Viewer extends User {
  email: string
  verified: boolean
  hasUnreadNotifications: boolean
}

export interface ViewerData {
  viewer: Viewer
}

export interface Story {
  name: string
  content: {
    body: string
  }
}
