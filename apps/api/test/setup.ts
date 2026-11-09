import { afterAll, beforeAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { db, pool } from '../src/db/client'
import { migrate } from '../src/db/migrate'

beforeAll(async () => {
  await migrate()
})

beforeEach(async () => {
  await db.execute(sql`TRUNCATE users, games, achievements, guides RESTART IDENTITY CASCADE`)
})

afterAll(async () => {
  await pool.end()
})
