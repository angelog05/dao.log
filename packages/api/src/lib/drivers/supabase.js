import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const db = {
  async getPosts() {
    return supabase
      .from('posts')
      .select('id, title, slug, excerpt, tags, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
  },

  async getPost(slug) {
    const result = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return result
  },

  async createPost(payload) {
    return supabase
      .from('posts')
      .insert(payload)
      .select()
      .single()
  },

  async updatePost(slug, updates) {
    return supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('slug', slug)
      .select()
      .single()
  },

  async deletePost(slug) {
    return supabase
      .from('posts')
      .delete()
      .eq('slug', slug)
  }
}

export default db
