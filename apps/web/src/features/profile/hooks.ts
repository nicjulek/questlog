import { useQuery } from '@tanstack/react-query'
import type { PublicProfile } from '@questlog/shared'
import { api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export const useProfile = (username: string) =>
  useQuery({ queryKey: keys.profile(username), queryFn: () => api.get<PublicProfile>(`/u/${username}`) })
