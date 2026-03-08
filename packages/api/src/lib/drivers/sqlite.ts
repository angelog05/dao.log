import { JSONFilePreset } from 'lowdb/node'
import { randomUUID } from 'crypto'
import 'dotenv/config'
import type { DbDriver, Post, PostSummary, CreatePostPayload, UpdatePostPayload, DbResult } from '../../types.js'

interface Schema {
  posts: Post[]
}

const defaultData: Schema = { posts: [] }
const database = await JSONFilePreset<Schema>('./dev.db.json', defaultData)

const db: DbDriver = {
  async getPosts(): Promise<DbResult<PostSummary[]>> {
    await database.read()
    const posts = database.data.posts
      .filter(p => p.published)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .map(({ id, title, slug, excerpt, tags, published_at, created_at }) =>
        ({ id, title, slug, excerpt, tags, published_at, created_at }))
    return { data: posts, error: null }
  },

  async getPost(slug: string): Promise<DbResult<Post>> {
    await database.read()
    const post = database.data.posts.find(p => p.slug === slug && p.published) ?? null
    return {
      data: post,
      error: post ? null : { message: 'Not found' }
    }
  },

  async createPost(payload: CreatePostPayload): Promise<DbResult<Post>> {
    await database.read()

    if (database.data.posts.find(p => p.slug === payload.slug)) {
      return { data: null, error: { message: `Slug "${payload.slug}" already exists` } }
    }

    const now = new Date().toISOString()
    const post: Post = {
      id: randomUUID(),
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      excerpt: payload.excerpt ?? '',
      tags: payload.tags ?? [],
      published: payload.published ?? true,
      published_at: payload.published_at ?? now,
      created_at: now,
      updated_at: now,
    }

    database.data.posts.push(post)
    await database.write()
    return { data: post, error: null }
  },

  async updatePost(slug: string, updates: UpdatePostPayload): Promise<DbResult<Post>> {
    await database.read()
    const idx = database.data.posts.findIndex(p => p.slug === slug)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }

    database.data.posts[idx] = {
      ...database.data.posts[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    await database.write()
    return { data: database.data.posts[idx], error: null }
  },

  async deletePost(slug: string): Promise<{ error: null }> {
    await database.read()
    database.data.posts = database.data.posts.filter(p => p.slug !== slug)
    await database.write()
    return { error: null }
  },
}

export default db
