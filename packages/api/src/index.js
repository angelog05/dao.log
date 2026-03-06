import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import postsRouter from './routes/posts.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dao-log-api' })
})

// Routes
app.use('/api/posts', postsRouter)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`dao-log API running on http://localhost:${PORT}`)
})
