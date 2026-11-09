import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Achievement, AchievementInput, GameDetail, GamePatch } from '@questlog/shared'
import { api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export function useGame(id: number) {
  return useQuery({ queryKey: keys.game(id), queryFn: () => api.get<GameDetail>(`/games/${id}`), enabled: Number.isInteger(id) && id > 0 })
}

function useRefresh(gameId: number) {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: keys.game(gameId) })
    qc.invalidateQueries({ queryKey: ['games'] })
    qc.invalidateQueries({ queryKey: keys.stats })
  }
}

export function useUpdateGame(id: number) {
  const qc = useQueryClient()
  const refresh = useRefresh(id)
  return useMutation({
    mutationFn: (patch: GamePatch) => api.patch<GameDetail>(`/games/${id}`, patch),
    onSuccess: (game) => {
      qc.setQueryData(keys.game(id), game)
      refresh()
    }
  })
}

export function useDeleteGame(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/games/${id}`),
    onSuccess: () => {
      qc.removeQueries({ queryKey: keys.game(id) })
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: keys.stats })
      qc.invalidateQueries({ queryKey: ['guides'] })
    }
  })
}

const recount = (g: GameDetail, list: Achievement[]): GameDetail => ({
  ...g,
  achievements: list,
  achievementsTotal: list.length,
  achievementsUnlocked: list.filter((a) => a.unlockedAt).length
})

export function useToggleAchievement(gameId: number) {
  const qc = useQueryClient()
  const refresh = useRefresh(gameId)
  return useMutation({
    mutationFn: ({ id, unlocked }: { id: number; unlocked: boolean }) =>
      api.patch<Achievement>(`/achievements/${id}`, { unlockedAt: unlocked ? new Date().toISOString() : null }),
    onMutate: async ({ id, unlocked }) => {
      await qc.cancelQueries({ queryKey: keys.game(gameId) })
      const prev = qc.getQueryData<GameDetail>(keys.game(gameId))
      if (prev) {
        const list = prev.achievements.map((a) => (a.id === id ? { ...a, unlockedAt: unlocked ? new Date().toISOString() : null } : a))
        qc.setQueryData(keys.game(gameId), recount(prev, list))
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(keys.game(gameId), ctx.prev),
    onSettled: refresh
  })
}

export function useAddAchievement(gameId: number) {
  const refresh = useRefresh(gameId)
  return useMutation({
    mutationFn: (input: Partial<AchievementInput>) => api.post<Achievement>(`/games/${gameId}/achievements`, input),
    onSuccess: refresh
  })
}

export function useBulkAdd(gameId: number) {
  const refresh = useRefresh(gameId)
  return useMutation({
    mutationFn: (text: string) => api.post<Achievement[]>(`/games/${gameId}/achievements/bulk`, { text }),
    onSuccess: refresh
  })
}

export function useUpdateAchievement(gameId: number) {
  const refresh = useRefresh(gameId)
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<AchievementInput>) => api.patch<Achievement>(`/achievements/${id}`, patch),
    onSuccess: refresh
  })
}

export function useDeleteAchievement(gameId: number) {
  const refresh = useRefresh(gameId)
  return useMutation({ mutationFn: (id: number) => api.delete(`/achievements/${id}`), onSuccess: refresh })
}
