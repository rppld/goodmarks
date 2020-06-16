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

export interface CommentEdge {
  comment: Comment
  author: User
}

export interface Comment {
  id: string
  text: string
  created: any
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

export interface BookmarksData {
  bookmarks: {
    bookmark: Bookmark
    category: BookmarkCategory
    bookmarkStats: BookmarkStats
    user: User
    comments: CommentEdge[]
  }[]
}

export interface ViewerData {
  viewer: User
}
