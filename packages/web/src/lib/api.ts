const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001'

// Matches API's PostSummary — returned by GET /api/posts (no content)
export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  published_at: string
  created_at: string
}

// Matches API's Post — returned by GET /api/posts/:slug (full content)
export interface Post extends PostSummary {
  content: string
  updated_at: string
}

export async function getPosts(): Promise<PostSummary[]> {
  const res = await fetch(`${API_URL}/api/posts`)
  if (!res.ok) return []
  return res.json()
}

export async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/api/posts/${slug}`)
  if (!res.ok) return null
  return res.json()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0]
}
