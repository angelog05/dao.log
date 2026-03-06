import { Router } from 'express'
import slugify from 'slug'
import db from '../lib/db.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

// ─── GET /api/posts ───────────────────────────────
router.get('/', async (req, res) => {
  const { data, error } = await db.getPosts()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ─── GET /api/posts/:slug ─────────────────────────
router.get('/:slug', async (req, res) => {
  const { data, error } = await db.getPost(req.params.slug)
  if (error || !data) return res.status(404).json({ error: 'Post not found' })
  res.json(data)
})

// ─── POST /api/posts ──────────────────────────────
// Body: { title, content, excerpt?, tags?, date?, published? }
router.post('/', requireAuth, async (req, res) => {
  const { title, content, excerpt, tags, date, published } = req.body

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' })
  }

  const slug = slugify(title, { lower: true })
  const published_at = date
    ? new Date(date).toISOString()
    : new Date().toISOString()

  const { data, error } = await db.createPost({
    title,
    slug,
    content,
    excerpt: excerpt || '',
    tags: tags || [],
    published: published ?? true,
    published_at
  })

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// ─── PATCH /api/posts/:slug ───────────────────────
router.patch('/:slug', requireAuth, async (req, res) => {
  const { data, error } = await db.updatePost(req.params.slug, req.body)
  if (error || !data) return res.status(404).json({ error: 'Post not found' })
  res.json(data)
})

// ─── DELETE /api/posts/:slug ──────────────────────
router.delete('/:slug', requireAuth, async (req, res) => {
  const { error } = await db.deletePost(req.params.slug)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Post deleted' })
})

export default router
