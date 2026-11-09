import { relations } from 'drizzle-orm'
import { boolean, doublePrecision, index, integer, jsonb, pgEnum, pgTable, serial, smallint, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { GAME_STATUSES, PLATFORMS } from '@questlog/shared'

export const gameStatus = pgEnum('game_status', GAME_STATUSES)
export const platform = pgEnum('platform', PLATFORMS)

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 24 }).notNull().unique(),
  displayName: varchar('display_name', { length: 40 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  bio: varchar('bio', { length: 280 }),
  ...timestamps
})

export const games = pgTable(
  'games',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 120 }).notNull(),
    platform: platform('platform').notNull().default('PC'),
    status: gameStatus('status').notNull().default('backlog'),
    hours: doublePrecision('hours'),
    rating: smallint('rating'),
    coverUrl: varchar('cover_url', { length: 500 }),
    notes: text('notes'),
    ...timestamps
  },
  (t) => [index('games_user_idx').on(t.userId)]
)

export const achievements = pgTable(
  'achievements',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 120 }).notNull(),
    description: varchar('description', { length: 500 }),
    secret: boolean('secret').notNull().default(false),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }),
    position: integer('position').notNull().default(0),
    ...timestamps
  },
  (t) => [index('achievements_game_idx').on(t.gameId), index('achievements_unlocked_idx').on(t.unlockedAt)]
)

export const guides = pgTable(
  'guides',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    content: jsonb('content').$type<Record<string, unknown>>().notNull(),
    published: boolean('published').notNull().default(false),
    ...timestamps
  },
  (t) => [uniqueIndex('guides_user_slug_idx').on(t.userId, t.slug)]
)

export const usersRelations = relations(users, ({ many }) => ({ games: many(games), guides: many(guides) }))
export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, { fields: [games.userId], references: [users.id] }),
  achievements: many(achievements),
  guides: many(guides)
}))
export const achievementsRelations = relations(achievements, ({ one }) => ({ game: one(games, { fields: [achievements.gameId], references: [games.id] }) }))
export const guidesRelations = relations(guides, ({ one }) => ({
  game: one(games, { fields: [guides.gameId], references: [games.id] }),
  user: one(users, { fields: [guides.userId], references: [users.id] })
}))
