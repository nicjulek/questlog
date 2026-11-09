export const nf = new Intl.NumberFormat('pt-BR')

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso)).replace(' de ', ' ').replace('.', '')
export const formatShort = (iso: string) => shortFmt.format(new Date(iso)).replace(' de ', ' ').replace('.', '')

export function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  if (diff < 60_000) return 'agora há pouco'
  if (diff < 3_600_000) return `há ${Math.round(diff / 60_000)} min`
  if (diff < day) return `há ${Math.round(diff / 3_600_000)} h`
  if (diff < 2 * day) return 'ontem'
  if (diff < 30 * day) return `há ${Math.round(diff / day)} dias`
  return formatDate(iso)
}

export const plural = (n: number, one: string, many: string) => `${nf.format(n)} ${n === 1 ? one : many}`

export const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0)

export function hours(h: number) {
  if (!h) return '0 h'
  return h < 1 ? `${Math.round(h * 60)} min` : `${nf.format(Math.round(h * 10) / 10)} h`
}
