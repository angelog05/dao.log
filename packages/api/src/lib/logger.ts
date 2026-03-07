// lib/logger.ts — minimal logger with timestamp and levels
// Used for business events (post created, auth failed, DB errors, etc.)
// HTTP request logging is handled by Morgan in index.ts

const timestamp = (): string => new Date().toISOString().replace('T', ' ').slice(0, 19)

const logger = {
  info: (msg: string): void => { console.log(`[${timestamp()}] [INFO]  ${msg}`) },
  warn: (msg: string): void => { console.warn(`[${timestamp()}] [WARN]  ${msg}`) },
  error: (msg: string): void => { console.error(`[${timestamp()}] [ERROR] ${msg}`) },
}

export default logger
