import 'dotenv/config'
import type { DbDriver } from '../types.js'

const driver = process.env.DB_DRIVER ?? 'sqlite'

let db: DbDriver

if (driver === 'supabase') {
  const { default: supabaseDb } = await import('./drivers/supabase.js')
  db = supabaseDb
} else {
  const { default: sqliteDb } = await import('./drivers/sqlite.js')
  db = sqliteDb
}

console.log(`[db] using driver: ${driver}`)

export default db
