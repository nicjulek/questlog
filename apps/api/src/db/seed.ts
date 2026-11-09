import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import type { GameStatus, Platform } from '@questlog/shared'
import { db, pool } from './client'
import { migrate } from './migrate'
import { achievements, games, guides, users } from './schema'
import { CHRONO_TRIGGER, DISCO_ELYSIUM, GRIS, OUTER_WILDS, type SeedAchievement } from './seed-data'

const DEMO = { username: 'nicole', password: 'questlog123' }

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const day = (iso: string) => new Date(`${iso}T20:00:00-03:00`).getTime()

function spread(list: SeedAchievement[], unlocked: number, from: string, to: string, seed: number) {
  const rand = seeded(seed)
  const a = day(from)
  const b = day(to)
  const stamps = Array.from({ length: unlocked }, () => a + rand() * (b - a)).sort((x, y) => x - y)
  const order = list.map((_, i) => i).sort(() => rand() - 0.5).slice(0, unlocked)
  const when = new Map(order.map((idx, k) => [idx, new Date(stamps[k] + Math.floor(rand() * 4) * 3600_000)]))
  return list.map(([title, description], i) => ({ title, description, unlockedAt: when.get(i) ?? null, position: i }))
}

type SeedGame = {
  title: string
  status: GameStatus
  platform?: Platform
  hours?: number
  rating?: number
  notes?: string
  achievements?: ReturnType<typeof spread>
  secret?: string[]
}

const GAMES: SeedGame[] = [
  { title: 'Gris', status: 'platinum', hours: 6.5, rating: 9, achievements: spread(GRIS, GRIS.length, '2026-01-10', '2026-02-14', 7), notes: 'Joguei com fone. A trilha sonora carrega o jogo inteiro.' },
  { title: 'Chrono Trigger', status: 'beaten', platform: 'PC', hours: 41, rating: 10, achievements: spread(CHRONO_TRIGGER, 10, '2026-02-20', '2026-05-02', 11) },
  { title: 'Outer Wilds', status: 'playing', hours: 27.5, rating: 10, achievements: spread(OUTER_WILDS, 14, '2026-05-10', '2026-09-28', 3), secret: ['Teve um destino trágico', 'Arqueólogo'], notes: 'Falta o DLC Echoes of the Eye.' },
  { title: 'Disco Elysium', status: 'playing', hours: 33, rating: 9, achievements: spread(DISCO_ELYSIUM, 22, '2026-08-01', '2026-11-03', 5) },
  { title: 'Hollow Knight', status: 'beaten', platform: 'Switch', hours: 48, rating: 10 },
  { title: 'Blue Prince', status: 'playing', hours: 19, rating: 9, notes: 'Ainda não cheguei no Quarto 46.' },
  { title: 'Inscryption', status: 'paused', hours: 7 },
  { title: 'Stray', status: 'beaten', platform: 'PlayStation', hours: 6, rating: 8 },
  { title: 'Tunic', status: 'backlog' },
  { title: 'Spiritfarer', status: 'backlog', platform: 'Switch' },
  { title: 'Sable', status: 'backlog' }
]

const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const h = (text: string) => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] })
const li = (text: string) => ({ type: 'listItem', content: [p(text)] })

const INUKSUIT = {
  type: 'doc',
  content: [
    p('Durante o capítulo 2, destrua todas as pequenas estátuas com sua habilidade de se transformar em bloco (você pode fazê-lo ao pular e usar a habilidade). Você pode começar pelo segundo checkpoint.'),
    h('Antes de começar'),
    { type: 'bulletList', content: [li('A habilidade de bloco é a do capítulo 2: pule e ative no ar para cair com força.'), li('Se perder uma estátua, volte ao checkpoint. O progresso das que já quebrou fica salvo.')] },
    h('Ordem das estátuas'),
    { type: 'orderedList', attrs: { start: 1 }, content: [li('As três primeiras ficam no corredor de colunas logo depois do segundo checkpoint.'), li('A quarta e a quinta ficam nas plataformas acima da área com a constelação.'), li('Da sexta em diante, siga pela parte de baixo do mapa antes de subir.'), li('As estátuas 13 e 14 ficam juntas, no fim do capítulo.')] },
    { type: 'blockquote', content: [p('Dica: as estátuas brilham levemente quando a câmera passa por elas. Vá devagar nas áreas escuras.')] }
  ]
}

const CONVERGENCIA = {
  type: 'doc',
  content: [
    p('Pegue todos os instrumentos dos viajantes simultaneamente com seu onduloscópio.'),
    h('O jeito mais fácil'),
    p('Vá beeeeeem longe do sistema solar e use seu onduloscópio para captar todos os instrumentos de uma vez só.')
  ]
}

async function run() {
  await migrate()
  await db.execute(sql`TRUNCATE users, games, achievements, guides RESTART IDENTITY CASCADE`)

  const [user] = await db
    .insert(users)
    .values({
      username: DEMO.username,
      displayName: 'Nicole',
      passwordHash: await bcrypt.hash(DEMO.password, 10),
      bio: 'Desenvolvedora e ilustradora. Caçando conquistas de jogos que pedem calma para explorar.',
      createdAt: new Date('2026-01-08T10:00:00-03:00')
    })
    .returning({ id: users.id })

  const ids: Record<string, number> = {}
  for (const g of GAMES) {
    const last = g.achievements?.reduce<number>((m, a) => Math.max(m, a.unlockedAt?.getTime() ?? 0), 0)
    const updatedAt = last ? new Date(last) : new Date('2026-06-01T12:00:00-03:00')
    const [row] = await db
      .insert(games)
      .values({ userId: user.id, title: g.title, status: g.status, platform: g.platform ?? 'PC', hours: g.hours ?? null, rating: g.rating ?? null, notes: g.notes ?? null, createdAt: updatedAt, updatedAt })
      .returning({ id: games.id })
    ids[g.title] = row.id
    if (g.achievements?.length) {
      await db.insert(achievements).values(g.achievements.map((a) => ({ ...a, gameId: row.id, secret: g.secret?.includes(a.title) ?? false })))
    }
  }

  await db.insert(guides).values([
    { userId: user.id, gameId: ids['Gris'], title: 'Inuksuit: todas as 14 estátuas', slug: 'inuksuit-todas-as-14-estatuas', content: INUKSUIT, published: true, updatedAt: new Date('2026-02-16T19:00:00-03:00') },
    { userId: user.id, gameId: ids['Outer Wilds'], title: 'Convergência sem estresse', slug: 'convergencia-sem-estresse', content: CONVERGENCIA, published: false }
  ])

  const [{ total }] = (await db.execute(sql`SELECT count(*)::int AS total FROM achievements`)).rows as { total: number }[]
  console.log(`Pronto: ${GAMES.length} jogos e ${total} conquistas.`)
  console.log(`Entre com usuário "${DEMO.username}" e senha "${DEMO.password}".`)
}

run()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
