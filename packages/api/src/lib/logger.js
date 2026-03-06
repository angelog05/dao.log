// lib/logger.js — minimal logger with timestamp and levels
// Used for business events (post created, auth failed, DB errors, etc.)
// HTTP request logging is handled by Morgan in index.js

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

const logger = {
  info:  (msg) => console.log(`[${timestamp()}] [INFO]  ${msg}`),
  warn:  (msg) => console.warn(`[${timestamp()}] [WARN]  ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] [ERROR] ${msg}`),
}

export default logger
