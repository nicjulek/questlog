import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Guide, GuideInput, GuideSummary } from '@questlog/shared'
import { api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export function useGuides(gameId?: number) {
  return useQuery({
    queryKey: keys.guides(gameId),
    queryFn: () => api.get<GuideSummary[]>(gameId ? `/games/${gameId}/guides` : '/guides')
  })
}

export function useGuide(id: number | null) {
  return useQuery({ queryKey: keys.guide(id ?? 0), queryFn: () => api.get<Guide>(`/guides/${id}`), enabled: !!id })
}

export function usePublicGuide(username: string, slug: string) {
  return useQuery({ queryKey: keys.publicGuide(username, slug), queryFn: () => api.get<Guide>(`/u/${username}/guides/${slug}`) })
}

export function useSaveGuide(gameId: number, id: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: GuideInput) => (id ? api.patch<Guide>(`/guides/${id}`, input) : api.post<Guide>(`/games/${gameId}/guides`, input)),
    onSuccess: (guide) => {
      qc.setQueryData(keys.guide(guide.id), guide)
      qc.invalidateQueries({ queryKey: ['guides'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: keys.stats })
    }
  })
}

export function useDeleteGuide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/guides/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guides'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: keys.stats })
    }
  })
}
