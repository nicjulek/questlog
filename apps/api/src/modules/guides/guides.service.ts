import { and, desc, eq, ne } from 'drizzle-orm'
import type { Guide, GuideInput, GuidePatch, GuideSummary } from '@questlog/shared'
import { db } from '../../db/client'
import { games, guides, users } from '../../db/schema'
import { notFound } from '../../lib/errors'
import { slugify } from '../../lib/slug'
import { assertOwnGame } from '../games/games.service'

const summaryColumns = {
  id: guides.id,
  gameId: guides.gameId,
  gameTitle: games.title,
  title: guides.title,
  slug: guides.slug,
  published: guides.published,
  updatedAt: guides.updatedAt
}

const toSummary = <T extends { updatedAt: Date }>(r: T) => ({ ...r, updatedAt: r.updatedAt.toISOString() })

async function uniqueSlug(userId: number, title: string, exceptId?: number) {
  const base = slugify(title)
  let slug = base
  for (let n = 2; ; n++) {
    const where = [eq(guides.userId, userId), eq(guides.slug, slug)]
    if (exceptId) where.push(ne(guides.id, exceptId))
    const taken = await db.query.guides.findFirst({ where: and(...where), columns: { id: true } })
    if (!taken) return slug
    slug = `${base}-${n}`
  }
}

export async function listGuides(userId: number, gameId?: number): Promise<GuideSummary[]> {
  const where = [eq(guides.userId, userId)]
  if (gameId) where.push(eq(guides.gameId, gameId))
  const rows = await db.select(summaryColumns).from(guides).innerJoin(games, eq(games.id, guides.gameId)).where(and(...where)).orderBy(desc(guides.updatedAt))
  return rows.map(toSummary)
}

async function fetchGuide(where: ReturnType<typeof and>): Promise<Guide | null> {
  const [r] = await db
    .select({ ...summaryColumns, content: guides.content, username: users.username, displayName: users.displayName })
    .from(guides)
    .innerJoin(games, eq(games.id, guides.gameId))
    .innerJoin(users, eq(users.id, guides.userId))
    .where(where)
  if (!r) return null
  const { username, displayName, ...rest } = r
  return { ...toSummary(rest), author: { username, displayName } }
}

export async function getGuide(userId: number, id: number) {
  const g = await fetchGuide(and(eq(guides.id, id), eq(guides.userId, userId)))
  if (!g) throw notFound('Guia')
  return g
}

export async function getPublicGuide(username: string, slug: string) {
  const g = await fetchGuide(and(eq(users.username, username.toLowerCase()), eq(guides.slug, slug), eq(guides.published, true)))
  if (!g) throw notFound('Guia')
  return g
}

export async function createGuide(userId: number, gameId: number, input: GuideInput) {
  await assertOwnGame(userId, gameId)
  const [g] = await db
    .insert(guides)
    .values({ ...input, gameId, userId, slug: await uniqueSlug(userId, input.title) })
    .returning({ id: guides.id })
  return getGuide(userId, g.id)
}

export async function updateGuide(userId: number, id: number, input: GuidePatch) {
  const slug = input.title ? await uniqueSlug(userId, input.title, id) : undefined
  const [g] = await db
    .update(guides)
    .set({ ...input, ...(slug && { slug }), updatedAt: new Date() })
    .where(and(eq(guides.id, id), eq(guides.userId, userId)))
    .returning({ id: guides.id })
  if (!g) throw notFound('Guia')
  return getGuide(userId, id)
}

export async function deleteGuide(userId: number, id: number) {
  const r = await db.delete(guides).where(and(eq(guides.id, id), eq(guides.userId, userId))).returning({ id: guides.id })
  if (!r.length) throw notFound('Guia')
}
