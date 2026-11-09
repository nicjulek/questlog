import { and, asc, desc, eq, ilike, max, sql } from 'drizzle-orm'
import type { Game, GameDetail, GameInput, GamePatch, GameStatus } from '@questlog/shared'
import { db } from '../../db/client'
import { achievements, games } from '../../db/schema'
import { notFound } from '../../lib/errors'

const iso = (d: Date | null) => (d ? d.toISOString() : null)

const gameColumns = {
  id: games.id,
  title: games.title,
  platform: games.platform,
  status: games.status,
  hours: games.hours,
  rating: games.rating,
  coverUrl: games.coverUrl,
  notes: games.notes,
  createdAt: games.createdAt,
  updatedAt: games.updatedAt,
  achievementsTotal: sql<number>`count(${achievements.id})::int`,
  achievementsUnlocked: sql<number>`count(${achievements.unlockedAt})::int`,
  lastUnlockedAt: max(achievements.unlockedAt)
}

type Row = { createdAt: Date; updatedAt: Date; lastUnlockedAt: Date | null } & Omit<Game, 'createdAt' | 'updatedAt' | 'lastUnlockedAt'>

const toGame = (r: Row): Game => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), lastUnlockedAt: iso(r.lastUnlockedAt) })

export async function listGames(userId: number, filter: { status?: GameStatus; q?: string } = {}) {
  const where = [eq(games.userId, userId)]
  if (filter.status) where.push(eq(games.status, filter.status))
  if (filter.q) where.push(ilike(games.title, `%${filter.q}%`))
  const rows = await db
    .select(gameColumns)
    .from(games)
    .leftJoin(achievements, eq(achievements.gameId, games.id))
    .where(and(...where))
    .groupBy(games.id)
    .orderBy(desc(sql`coalesce(max(${achievements.unlockedAt}), ${games.updatedAt})`))
  return rows.map(toGame)
}

export async function assertOwnGame(userId: number, gameId: number) {
  const game = await db.query.games.findFirst({ where: and(eq(games.id, gameId), eq(games.userId, userId)), columns: { id: true } })
  if (!game) throw notFound('Jogo')
}

export async function getGame(userId: number, id: number): Promise<GameDetail> {
  const [row] = await db
    .select(gameColumns)
    .from(games)
    .leftJoin(achievements, eq(achievements.gameId, games.id))
    .where(and(eq(games.id, id), eq(games.userId, userId)))
    .groupBy(games.id)
  if (!row) throw notFound('Jogo')
  const list = await db.select().from(achievements).where(eq(achievements.gameId, id)).orderBy(asc(achievements.position), asc(achievements.id))
  return {
    ...toGame(row),
    achievements: list.map((a) => ({
      id: a.id,
      gameId: a.gameId,
      title: a.title,
      description: a.description,
      secret: a.secret,
      unlockedAt: iso(a.unlockedAt),
      position: a.position
    }))
  }
}

export async function createGame(userId: number, input: GameInput) {
  const [g] = await db.insert(games).values({ ...input, userId }).returning({ id: games.id })
  return getGame(userId, g.id)
}

export async function updateGame(userId: number, id: number, input: GamePatch) {
  const [g] = await db
    .update(games)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(games.id, id), eq(games.userId, userId)))
    .returning({ id: games.id })
  if (!g) throw notFound('Jogo')
  return getGame(userId, id)
}

export async function deleteGame(userId: number, id: number) {
  const r = await db.delete(games).where(and(eq(games.id, id), eq(games.userId, userId))).returning({ id: games.id })
  if (!r.length) throw notFound('Jogo')
}
