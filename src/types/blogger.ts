interface BloggerText {
  $t: string
}

interface BloggerLink {
  rel: string
  href: string
}

interface BloggerCategory {
  $t: string
}

interface BloggerThumbnail {
  url: string
}

export interface BloggerEntry {
  title?: BloggerText
  content?: BloggerText
  summary?: BloggerText
  published?: BloggerText
  link?: BloggerLink[]
  category?: BloggerCategory[]
  'media$thumbnail'?: BloggerThumbnail
}

export interface BloggerFeed {
  feed?: {
    entry?: BloggerEntry[]
  }
}