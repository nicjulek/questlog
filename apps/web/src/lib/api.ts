import type { ApiErrorBody } from '@questlog/shared'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {}
  ) {
    super(message)
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new ApiError(0, 'Sem conexão com o servidor. Confira se a API está rodando.')
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = data as Partial<ApiErrorBody>
    throw new ApiError(res.status, err.error ?? 'Algo deu errado. Tente de novo.', err.fields)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path)
}

export const fieldErrors = (err: unknown) => (err instanceof ApiError ? err.fields : {})
export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Algo deu errado. Tente de novo.')
