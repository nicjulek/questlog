import type { GameStatus, Platform } from './constants'

export interface User {
  id: number
  username: string
  displayName: string
  bio: string | null
}

export interface Game {
  id: number
  title: string
  platform: Platform
  status: GameStatus
  hours: number | null
  rating: number | null
  coverUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  achievementsTotal: number
  achievementsUnlocked: number
  lastUnlockedAt: string | null
}

export interface Achievement {
  id: number
  gameId: number
  title: string
  description: string | null
  secret: boolean
  unlockedAt: string | null
  position: number
}

export interface GameDetail extends Game {
  achievements: Achievement[]
}

export interface GuideSummary {
  id: number
  gameId: number
  gameTitle: string
  title: string
  slug: string
  published: boolean
  updatedAt: string
}

export interface Guide extends GuideSummary {
  content: Record<string, unknown>
  author: { username: string; displayName: string }
}

export interface Stats {
  games: number
  byStatus: Record<GameStatus, number>
  achievementsTotal: number
  achievementsUnlocked: number
  hours: number
  perfectGames: number
  guides: number
  unlocksByDay: { day: string; total: number }[]
  recent: { id: number; title: string; gameId: number; gameTitle: string; unlockedAt: string }[]
  closest: { id: number; title: string; total: number; unlocked: number }[]
}

export interface PublicProfile {
  user: Pick<User, 'username' | 'displayName' | 'bio'> & { memberSince: string }
  totals: { games: number; achievementsUnlocked: number; perfectGames: number; hours: number }
  showcase: Pick<Game, 'id' | 'title' | 'platform' | 'status' | 'coverUrl' | 'achievementsTotal' | 'achievementsUnlocked'>[]
  guides: GuideSummary[]
}

export interface ApiErrorBody {
  error: string
  fields?: Record<string, string>
}
