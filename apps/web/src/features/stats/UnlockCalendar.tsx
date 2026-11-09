import { useMemo } from 'react'
import { plural } from '../../lib/format'
import styles from './UnlockCalendar.module.css'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const CELL = 14
const GAP = 4

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function UnlockCalendar({ days }: { days: { day: string; total: number }[] }) {
  const { weeks, months, max } = useMemo(() => {
    const counts = new Map(days.map((d) => [d.day, d.total]))
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const start = new Date(end)
    start.setDate(start.getDate() - 52 * 7 - end.getDay())
    const weeks: { date: Date; total: number }[][] = []
    const months: { label: string; col: number }[] = []
    let lastMonth = -1
    for (let d = new Date(start), i = 0; d <= end; d.setDate(d.getDate() + 1), i++) {
      const col = Math.floor(i / 7)
      if (!weeks[col]) weeks[col] = []
      weeks[col].push({ date: new Date(d), total: counts.get(key(d)) ?? 0 })
      if (d.getDate() <= 7 && d.getMonth() !== lastMonth && d.getDay() === 0) {
        months.push({ label: MONTHS[d.getMonth()], col })
        lastMonth = d.getMonth()
      }
    }
    return { weeks, months, max: Math.max(1, ...days.map((d) => d.total)) }
  }, [days])

  const width = weeks.length * (CELL + GAP)
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })

  return (
    <div className={styles.scroll} tabIndex={0} aria-label="Conquistas por dia no último ano">
      <svg width={width} height={7 * (CELL + GAP) + 22} className={styles.svg} role="img" aria-label={`${plural(days.reduce((s, d) => s + d.total, 0), 'conquista', 'conquistas')} no último ano`}>
        {months.map((m) => (
          <text key={`${m.label}${m.col}`} x={m.col * (CELL + GAP)} y={12} className={styles.month}>
            {m.label}
          </text>
        ))}
        <g transform="translate(0 22)">
          {weeks.map((w, c) =>
            w.map((d) => {
              const x = c * (CELL + GAP) + CELL / 2
              const y = d.date.getDay() * (CELL + GAP) + CELL / 2
              const level = d.total ? 0.35 + (d.total / max) * 0.65 : 0
              return (
                <g key={d.date.getTime()}>
                  <title>{d.total ? `${fmt.format(d.date)}: ${plural(d.total, 'conquista', 'conquistas')}` : fmt.format(d.date)}</title>
                  {d.total ? (
                    <>
                      <circle cx={x} cy={y} r={CELL / 2 + 2} className={styles.halo} opacity={level * 0.5} />
                      <circle cx={x} cy={y} r={2.5 + level * 3.5} className={styles.lit} opacity={level} />
                    </>
                  ) : (
                    <circle cx={x} cy={y} r={1.6} className={styles.empty} />
                  )}
                </g>
              )
            })
          )}
        </g>
      </svg>
    </div>
  )
}
