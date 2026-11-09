import { z } from 'zod'
import { GAME_STATUSES, PLATFORMS } from './constants'

const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) =>
  text(max)
    .nullish()
    .transform((v) => (v ? v : null))

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Use pelo menos 3 caracteres.')
  .max(24, 'Use até 24 caracteres.')
  .regex(/^[a-z0-9_]+$/, 'Use só letras minúsculas, números e _.')

export const registerSchema = z.object({
  username: usernameSchema,
  displayName: text(40).min(1, 'Informe como quer ser chamado.'),
  password: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres.').max(100)
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Informe o usuário.'),
  password: z.string().min(1, 'Informe a senha.')
})
export type LoginInput = z.infer<typeof loginSchema>

export const profileSchema = z.object({
  displayName: text(40).min(1, 'Informe como quer ser chamado.'),
  bio: optionalText(280)
})
export type ProfileInput = z.infer<typeof profileSchema>

export const gameSchema = z.object({
  title: text(120).min(1, 'Informe o nome do jogo.'),
  platform: z.enum(PLATFORMS).default('PC'),
  status: z.enum(GAME_STATUSES).default('backlog'),
  hours: z.number().min(0, 'As horas não podem ser negativas.').max(99999).nullish().transform((v) => v ?? null),
  rating: z.number().int().min(1).max(10).nullish().transform((v) => v ?? null),
  coverUrl: z
    .string()
    .trim()
    .url('Use um link de imagem completo, começando com https://.')
    .max(500)
    .nullish()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  notes: optionalText(5000)
})
export type GameInput = z.infer<typeof gameSchema>
export const gamePatchSchema = gameSchema.partial()
export type GamePatch = z.infer<typeof gamePatchSchema>

export const achievementSchema = z.object({
  title: text(120).min(1, 'Informe o nome da conquista.'),
  description: optionalText(500),
  secret: z.boolean().default(false),
  unlockedAt: z.string().datetime().nullish().transform((v) => v ?? null)
})
export type AchievementInput = z.infer<typeof achievementSchema>
export const achievementPatchSchema = achievementSchema.partial()
export type AchievementPatch = z.infer<typeof achievementPatchSchema>

export const bulkAchievementsSchema = z.object({
  text: z.string().max(20000).refine((t) => t.trim().length > 0, 'Cole pelo menos uma conquista.')
})

export const guideSchema = z.object({
  title: text(120).min(1, 'Dê um título ao guia.'),
  content: z.record(z.unknown()),
  published: z.boolean().default(false)
})
export type GuideInput = z.infer<typeof guideSchema>
export const guidePatchSchema = guideSchema.partial()
export type GuidePatch = z.infer<typeof guidePatchSchema>

export function parseBulkAchievements(raw: string) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 200)
    .map((line) => {
      const secret = line.startsWith('*')
      const clean = line.replace(/^\*\s*/, '')
      const [title, ...rest] = clean.split(/\s+[-–—:]\s+/)
      const description = rest.join(' - ').trim()
      return { title: title.trim().slice(0, 120), description: description ? description.slice(0, 500) : null, secret }
    })
    .filter((a) => a.title)
}
