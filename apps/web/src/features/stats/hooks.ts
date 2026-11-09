import { useQuery } from '@tanstack/react-query'
import type { Stats } from '@questlog/shared'
import { api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export const useStats = () => useQuery({ queryKey: keys.stats, queryFn: () => api.get<Stats>('/stats') })
