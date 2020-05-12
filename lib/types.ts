export interface BookmarksData {
  bookmarks: any
  user: any
  comments: any
}

export interface Viewer {
  id: string
  handle: string
  name: string
  picture: string
}

export interface ViewerData {
  viewer: Viewer
}
