import { Request, Response, NextFunction } from 'express'
import logger from './logger.js'

/**
 * Middleware: validates the API_SECRET header
 * Header: Authorization: Bearer <API_SECRET>
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers['authorization']
  const secret = process.env.API_SECRET

  if (!secret) {
    logger.warn('[auth] API_SECRET not set — auth disabled in dev mode')
    next()
    return
  }

  if (!auth || auth !== `Bearer ${secret}`) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
    logger.warn(`[auth] unauthorized attempt on ${req.method} ${req.path} from ${ip}`)
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
