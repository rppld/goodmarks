export interface Bookmark {
  id: string
  text: string
  comments: number
  likes: number
  reposts: number
  details: any
}

export interface Comment {
  id: string
  text: string
}

export interface User {
  id: string
  handle: string
  name: string
  picture: string
}

export interface BookmarksData {
  bookmarks: {
    bookmark: Bookmark
    category: any
    bookmarkStats: any
    user: User
    comments: [{ comment: Comment; author: User }]
  }[]
}

export interface ViewerData {
  viewer: User
}
