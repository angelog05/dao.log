import { Router } from 'express'
import slugify from 'slug'
import db from '../lib/db.js'
import { requireAuth } from '../lib/auth.js'
import logger from '../lib/logger.js'

const router = Router()

// ─── GET /api/posts ───────────────────────────────
router.get('/', async (req, res) => {
  const { data, error } = await db.getPosts()
  if (error) {
    logger.error(`[posts] getPosts failed: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
  logger.info(`[posts] listed ${data.length} post(s)`)
  res.json(data)
})

// ─── GET /api/posts/:slug ─────────────────────────
router.get('/:slug', async (req, res) => {
  const { slug } = req.params
  const { data, error } = await db.getPost(slug)
  if (error || !data) {
    logger.warn(`[posts] not found: "${slug}"`)
    return res.status(404).json({ error: 'Post not found' })
  }
  logger.info(`[posts] fetched "${slug}"`)
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

  if (error) {
    logger.error(`[posts] createPost failed: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
  logger.info(`[posts] created "${slug}"`)
  res.status(201).json(data)
})

// ─── PATCH /api/posts/:slug ───────────────────────
router.patch('/:slug', requireAuth, async (req, res) => {
  const { slug } = req.params
  const { data, error } = await db.updatePost(slug, req.body)
  if (error || !data) {
    logger.warn(`[posts] updatePost not found: "${slug}"`)
    return res.status(404).json({ error: 'Post not found' })
  }
  logger.info(`[posts] updated "${slug}"`)
  res.json(data)
})

// ─── DELETE /api/posts/:slug ──────────────────────
router.delete('/:slug', requireAuth, async (req, res) => {
  const { slug } = req.params
  const { error } = await db.deletePost(slug)
  if (error) {
    logger.error(`[posts] deletePost failed: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
  logger.warn(`[posts] deleted "${slug}"`)
  res.json({ message: 'Post deleted' })
})

export default router
