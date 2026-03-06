/**
 * Middleware: validates the API_SECRET header
 * Header: Authorization: Bearer <API_SECRET>
 */
export function requireAuth(req, res, next) {
  const auth = req.headers['authorization']
  const secret = process.env.API_SECRET

  if (!secret) {
    console.warn('API_SECRET not set — auth disabled in dev mode')
    return next()
  }

  if (!auth || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
