import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => !(err instanceof ApiError && [401, 403, 404].includes(err.status)) && count < 2
    }
  }
})

export const keys = {
  me: ['me'] as const,
  games: (filter?: object) => ['games', filter ?? {}] as const,
  game: (id: number) => ['game', id] as const,
  guides: (gameId?: number) => ['guides', gameId ?? 'all'] as const,
  guide: (id: number) => ['guide', id] as const,
  stats: ['stats'] as const,
  profile: (username: string) => ['profile', username] as const,
  publicGuide: (username: string, slug: string) => ['public-guide', username, slug] as const
}
