import { sql } from 'drizzle-orm'
import { GAME_STATUSES, type GameStatus, type Stats } from '@questlog/shared'
import { db } from '../../db/client'

export async function getStats(userId: number): Promise<Stats> {
  const one = async <T>(q: ReturnType<typeof sql>) => (await db.execute(q)).rows as T[]

  const [totals] = await one<{ games: number; hours: number; guides: number }>(sql`
    SELECT count(*)::int AS games, coalesce(sum(hours), 0)::float AS hours,
      (SELECT count(*)::int FROM guides WHERE user_id = ${userId}) AS guides
    FROM games WHERE user_id = ${userId}`)

  const statusRows = await one<{ status: GameStatus; total: number }>(sql`
    SELECT status, count(*)::int AS total FROM games WHERE user_id = ${userId} GROUP BY status`)

  const perGame = await one<{ id: number; title: string; total: number; unlocked: number }>(sql`
    SELECT g.id, g.title, count(a.id)::int AS total, count(a.unlocked_at)::int AS unlocked
    FROM games g JOIN achievements a ON a.game_id = g.id
    WHERE g.user_id = ${userId} GROUP BY g.id`)

  const unlocksByDay = await one<{ day: string; total: number }>(sql`
    SELECT to_char(a.unlocked_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS day, count(*)::int AS total
    FROM achievements a JOIN games g ON g.id = a.game_id
    WHERE g.user_id = ${userId} AND a.unlocked_at > now() - interval '371 days'
    GROUP BY 1 ORDER BY 1`)

  const recent = await one<{ id: number; title: string; gameId: number; gameTitle: string; unlockedAt: Date }>(sql`
    SELECT a.id, a.title, g.id AS "gameId", g.title AS "gameTitle", a.unlocked_at AS "unlockedAt"
    FROM achievements a JOIN games g ON g.id = a.game_id
    WHERE g.user_id = ${userId} AND a.unlocked_at IS NOT NULL
    ORDER BY a.unlocked_at DESC LIMIT 8`)

  const byStatus = Object.fromEntries(GAME_STATUSES.map((s) => [s, 0])) as Record<GameStatus, number>
  for (const r of statusRows) byStatus[r.status] = r.total

  return {
    games: totals.games,
    hours: totals.hours,
    guides: totals.guides,
    byStatus,
    achievementsTotal: perGame.reduce((s, g) => s + g.total, 0),
    achievementsUnlocked: perGame.reduce((s, g) => s + g.unlocked, 0),
    perfectGames: perGame.filter((g) => g.total > 0 && g.unlocked === g.total).length,
    unlocksByDay,
    recent: recent.map((r) => ({ ...r, unlockedAt: new Date(r.unlockedAt).toISOString() })),
    closest: perGame
      .filter((g) => g.unlocked < g.total && g.unlocked > 0)
      .sort((a, b) => b.unlocked / b.total - a.unlocked / a.total || a.total - a.unlocked - (b.total - b.unlocked))
      .slice(0, 4)
  }
}
