import { and, eq, max } from 'drizzle-orm'
import { parseBulkAchievements, type AchievementInput, type AchievementPatch } from '@questlog/shared'
import { db } from '../../db/client'
import { achievements, games } from '../../db/schema'
import { notFound } from '../../lib/errors'
import { assertOwnGame } from '../games/games.service'

const toDate = (v: string | null | undefined) => (v === undefined ? undefined : v === null ? null : new Date(v))

const view = (a: typeof achievements.$inferSelect) => ({
  id: a.id,
  gameId: a.gameId,
  title: a.title,
  description: a.description,
  secret: a.secret,
  unlockedAt: a.unlockedAt?.toISOString() ?? null,
  position: a.position
})

async function nextPosition(gameId: number) {
  const [r] = await db.select({ m: max(achievements.position) }).from(achievements).where(eq(achievements.gameId, gameId))
  return (r?.m ?? -1) + 1
}

async function touchGame(gameId: number) {
  await db.update(games).set({ updatedAt: new Date() }).where(eq(games.id, gameId))
}

export async function addAchievement(userId: number, gameId: number, input: AchievementInput) {
  await assertOwnGame(userId, gameId)
  const [a] = await db
    .insert(achievements)
    .values({ ...input, unlockedAt: toDate(input.unlockedAt), gameId, position: await nextPosition(gameId) })
    .returning()
  await touchGame(gameId)
  return view(a)
}

export async function addMany(userId: number, gameId: number, text: string) {
  await assertOwnGame(userId, gameId)
  const items = parseBulkAchievements(text)
  if (!items.length) return []
  const start = await nextPosition(gameId)
  const rows = await db
    .insert(achievements)
    .values(items.map((a, i) => ({ ...a, gameId, position: start + i })))
    .returning()
  await touchGame(gameId)
  return rows.map(view)
}

async function ownedAchievement(userId: number, id: number) {
  const [row] = await db
    .select({ a: achievements })
    .from(achievements)
    .innerJoin(games, eq(games.id, achievements.gameId))
    .where(and(eq(achievements.id, id), eq(games.userId, userId)))
  if (!row) throw notFound('Conquista')
  return row.a
}

export async function updateAchievement(userId: number, id: number, input: AchievementPatch) {
  const current = await ownedAchievement(userId, id)
  const [a] = await db
    .update(achievements)
    .set({ ...input, unlockedAt: toDate(input.unlockedAt), updatedAt: new Date() })
    .where(eq(achievements.id, id))
    .returning()
  await touchGame(current.gameId)
  return view(a)
}

export async function deleteAchievement(userId: number, id: number) {
  const current = await ownedAchievement(userId, id)
  await db.delete(achievements).where(eq(achievements.id, id))
  await touchGame(current.gameId)
}
