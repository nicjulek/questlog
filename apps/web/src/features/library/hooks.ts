import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Game, GameDetail, GameInput, GameStatus } from '@questlog/shared'
import { api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export function useGames(filter: { status?: GameStatus | null; q?: string } = {}) {
  const params = new URLSearchParams()
  if (filter.status) params.set('status', filter.status)
  if (filter.q?.trim()) params.set('q', filter.q.trim())
  const qs = params.toString()
  return useQuery({
    queryKey: keys.games({ status: filter.status ?? null, q: filter.q?.trim() ?? '' }),
    queryFn: () => api.get<Game[]>(`/games${qs ? `?${qs}` : ''}`),
    placeholderData: (prev) => prev
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<GameInput>) => api.post<GameDetail>('/games', input),
    onSuccess: (game) => {
      qc.setQueryData(keys.game(game.id), game)
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: keys.stats })
    }
  })
}
