import path from 'node:path'
import { migrate as runMigrations } from 'drizzle-orm/node-postgres/migrator'
import { db } from './client'

const folder = process.env.MIGRATIONS_DIR ?? path.resolve(process.cwd(), 'drizzle')

export const migrate = () => runMigrations(db, { migrationsFolder: folder })
