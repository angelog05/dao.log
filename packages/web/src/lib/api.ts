const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001'

export interface Post {
  id: string
  title: string
  slug: string
  content?: string
  excerpt: string
  tags: string[]
  published: boolean
  published_at: string
  created_at: string
}

export async function getPosts(): Promise<Post[]> {
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
