import { JSONFilePreset } from 'lowdb/node'
import { randomUUID } from 'crypto'
import 'dotenv/config'

const defaultData = { posts: [] }
const database = await JSONFilePreset('./dev.db.json', defaultData)

const db = {
  async getPosts() {
    await database.read()
    const posts = database.data.posts
      .filter(p => p.published)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .map(({ id, title, slug, excerpt, tags, published_at, created_at }) =>
        ({ id, title, slug, excerpt, tags, published_at, created_at }))
    return { data: posts, error: null }
  },

  async getPost(slug) {
    await database.read()
    const post = database.data.posts.find(p => p.slug === slug && p.published)
    return {
      data: post || null,
      error: post ? null : { message: 'Not found' }
    }
  },

  async createPost({ title, slug, content, excerpt, tags, published, published_at }) {
    await database.read()

    // Check slug uniqueness
    if (database.data.posts.find(p => p.slug === slug)) {
      return { data: null, error: { message: `Slug "${slug}" already exists` } }
    }

    const now = new Date().toISOString()
    const post = {
      id: randomUUID(),
      title,
      slug,
      content,
      excerpt: excerpt || '',
      tags: tags || [],
      published: published ?? true,
      published_at: published_at || now,
      created_at: now,
      updated_at: now
    }

    database.data.posts.push(post)
    await database.write()
    return { data: post, error: null }
  },

  async updatePost(slug, updates) {
    await database.read()
    const idx = database.data.posts.findIndex(p => p.slug === slug)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }

    database.data.posts[idx] = {
      ...database.data.posts[idx],
      ...updates,
      updated_at: new Date().toISOString()
    }
    await database.write()
    return { data: database.data.posts[idx], error: null }
  },

  async deletePost(slug) {
    await database.read()
    database.data.posts = database.data.posts.filter(p => p.slug !== slug)
    await database.write()
    return { error: null }
  }
}

export default db
