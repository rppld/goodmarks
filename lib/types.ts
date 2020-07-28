export interface Bookmark {
  id: string
  created: any
  text: string
  comments: number
  likes: number
  reposts: number
  details: any
}

export interface List {
  id: string
  created: any
  name: string
  description: string
  comments: number
  likes: number
  reposts: number
  items: Bookmark[]
  hashtags: any
  ts: number
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

export interface Notification {
  id: string
  type: string
  objectType: string
  objectUrl: string
  read: boolean
}

export interface User {
  id: string
  handle: string
  name: string
  picture: string
  bio: string
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
  authorEmail: string
  category: BookmarkCategory
  original: any
  bookmark: Bookmark
  bookmarkStats: BookmarkStats
  comments: CommentNode[]
}

export interface BookmarksData {
  edges: BookmarkNode[]
}

export interface ListItem {
  id: string
  bookmark: BookmarkNode
}

export interface ListsData {
  edges: {
    list: List
    items: ListItem[]
    listStats: ListStats
    author: User
    comments: CommentNode[]
  }[]
}

export interface ViewerData {
  viewer: User
}

export interface Story {
  name: string
  content: {
    body: string
  }
}
