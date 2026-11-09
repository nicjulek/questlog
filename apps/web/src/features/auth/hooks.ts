import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LoginInput, ProfileInput, RegisterInput, User } from '@questlog/shared'
import { ApiError, api } from '../../lib/api'
import { keys } from '../../lib/queryClient'

export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: async () => {
      try {
        return await api.get<User>('/auth/me')
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null
        throw err
      }
    },
    staleTime: Infinity
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<User>('/auth/login', input),
    onSuccess: (user) => {
      qc.clear()
      qc.setQueryData(keys.me, user)
    }
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<User>('/auth/register', input),
    onSuccess: (user) => {
      qc.clear()
      qc.setQueryData(keys.me, user)
    }
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      qc.clear()
      qc.setQueryData(keys.me, null)
    }
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProfileInput) => api.patch<User>('/auth/me', input),
    onSuccess: (user) => {
      qc.setQueryData(keys.me, user)
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
