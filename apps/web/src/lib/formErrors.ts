import type { ZodIssue } from 'zod'

export function issuesToFields(issues: ZodIssue[]) {
  const out: Record<string, string> = {}
  for (const i of issues) {
    const key = String(i.path[0] ?? 'form')
    out[key] ??= i.message
  }
  return out
}
