import { and, desc, eq, sql } from 'drizzle-orm'
import type { PublicProfile } from '@questlog/shared'
import { db } from '../../db/client'
import { games, guides, users } from '../../db/schema'
import { notFound } from '../../lib/errors'

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const user = await db.query.users.findFirst({ where: eq(users.username, username.toLowerCase()) })
  if (!user) throw notFound('Perfil')

  const rows = (
    await db.execute(sql`
      SELECT g.id, g.title, g.platform, g.status, g.cover_url AS "coverUrl", coalesce(g.hours, 0)::float AS hours,
        count(a.id)::int AS "achievementsTotal", count(a.unlocked_at)::int AS "achievementsUnlocked"
      FROM games g LEFT JOIN achievements a ON a.game_id = g.id
      WHERE g.user_id = ${user.id}
      GROUP BY g.id`)
  ).rows as (PublicProfile['showcase'][number] & { hours: number })[]

  const published = await db
    .select({ id: guides.id, gameId: guides.gameId, gameTitle: games.title, title: guides.title, slug: guides.slug, published: guides.published, updatedAt: guides.updatedAt })
    .from(guides)
    .innerJoin(games, eq(games.id, guides.gameId))
    .where(and(eq(guides.userId, user.id), eq(guides.published, true)))
    .orderBy(desc(guides.updatedAt))

  const perfect = rows.filter((g) => g.achievementsTotal > 0 && g.achievementsUnlocked === g.achievementsTotal)
  const showcase = [...rows]
    .filter((g) => g.achievementsUnlocked > 0 || g.status === 'platinum' || g.status === 'beaten')
    .sort((a, b) => b.achievementsUnlocked / Math.max(1, b.achievementsTotal) - a.achievementsUnlocked / Math.max(1, a.achievementsTotal))
    .slice(0, 6)
    .map(({ hours: _h, ...g }) => g)

  return {
    user: { username: user.username, displayName: user.displayName, bio: user.bio, memberSince: user.createdAt.toISOString() },
    totals: {
      games: rows.length,
      achievementsUnlocked: rows.reduce((s, g) => s + g.achievementsUnlocked, 0),
      perfectGames: perfect.length,
      hours: rows.reduce((s, g) => s + g.hours, 0)
    },
    showcase,
    guides: published.map((g) => ({ ...g, updatedAt: g.updatedAt.toISOString() }))
  }
}
