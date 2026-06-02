export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  tags: string[]
  published: boolean
  published_at: string
  created_at: string
  updated_at: string
  // i18n — optional Spanish translations
  title_es?:   string | null
  excerpt_es?: string | null
  content_es?: string | null
}

export type PostSummary = Omit<Post, 'content' | 'content_es' | 'updated_at' | 'published'>

export interface CreatePostPayload {
  title: string
  slug: string
  content: string
  excerpt?: string
  tags?: string[]
  published?: boolean
  published_at?: string
  // i18n
  title_es?:   string
  excerpt_es?: string
  content_es?: string
}

export type UpdatePostPayload = Partial<Omit<Post, 'id' | 'created_at'>>

export interface DbResult<T> {
  data: T | null
  error: { message: string } | null
}

export interface DbDriver {
  getPosts(): Promise<DbResult<PostSummary[]>>
  getPost(slug: string): Promise<DbResult<Post>>
  createPost(payload: CreatePostPayload): Promise<DbResult<Post>>
  updatePost(slug: string, updates: UpdatePostPayload): Promise<DbResult<Post>>
  deletePost(slug: string): Promise<{ error: { message: string } | null }>
}
