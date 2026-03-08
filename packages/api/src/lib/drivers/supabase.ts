import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import type { DbDriver, Post, PostSummary, CreatePostPayload, UpdatePostPayload, DbResult } from '../../types.js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const db: DbDriver = {
  async getPosts(): Promise<DbResult<PostSummary[]>> {
    const result = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, tags, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
    return result as unknown as DbResult<PostSummary[]>
  },

  async getPost(slug: string): Promise<DbResult<Post>> {
    const result = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return result as unknown as DbResult<Post>
  },

  async createPost(payload: CreatePostPayload): Promise<DbResult<Post>> {
    const result = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single()
    return result as unknown as DbResult<Post>
  },

  async updatePost(slug: string, updates: UpdatePostPayload): Promise<DbResult<Post>> {
    const result = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('slug', slug)
      .select()
      .single()
    return result as unknown as DbResult<Post>
  },

  async deletePost(slug: string): Promise<{ error: { message: string } | null }> {
    const result = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug)
    return result as unknown as { error: { message: string } | null }
  },
}

export default db
