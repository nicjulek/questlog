import { useId, useMemo } from 'react'
import clsx from 'clsx'
import type { Achievement } from '@questlog/shared'
import { constellation } from '../../lib/constellation'
import styles from './Constellation.module.css'

type Props = {
  seed: string
  achievements: Pick<Achievement, 'id' | 'title' | 'secret' | 'unlockedAt'>[]
  variant?: 'hero' | 'compact' | 'mini'
  activeId?: number | null
  onHover?: (id: number | null) => void
  onSelect?: (id: number) => void
  className?: string
}

const SIZE = { hero: { w: 1000, h: 380, pad: 46, dust: 90 }, compact: { w: 460, h: 340, pad: 30, dust: 50 }, mini: { w: 300, h: 170, pad: 22, dust: 18 } }

export function Constellation({ seed, achievements, variant = 'mini', activeId, onHover, onSelect, className }: Props) {
  const gid = useId()
  const s = SIZE[variant]
  const layout = useMemo(() => constellation(seed, achievements.length, s.w, s.h, s.pad, s.dust), [seed, achievements.length, s])
  const lit = achievements.map((a) => !!a.unlockedAt)
  const interactive = !!onSelect
  const scale = variant === 'mini' ? 0.62 : 1

  return (
    <svg
      className={clsx(styles.sky, styles[variant], className)}
      viewBox={`0 0 ${s.w} ${s.h}`}
      preserveAspectRatio="xMidYMid meet"
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? 'Constelação de conquistas' : `${lit.filter(Boolean).length} de ${achievements.length} conquistas`}
      onMouseLeave={() => onHover?.(null)}
    >
      <defs>
        <radialGradient id={`${gid}-glow`}>
          <stop offset="0%" stopColor="#ffe7a8" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#ffe7a8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffe7a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {layout.dust.map((d, i) => (
        <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill="#ece9ff" opacity={d.o} />
      ))}

      {layout.edges.map(([a, b]) => {
        const on = lit[a] && lit[b]
        const p = layout.points[a]
        const q = layout.points[b]
        return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={on ? styles.edgeOn : styles.edgeOff} />
      })}

      {achievements.map((a, i) => {
        const p = layout.points[i]
        if (!p) return null
        const on = lit[i]
        const active = activeId === a.id
        const hidden = a.secret && !on
        const label = `${hidden ? 'Conquista secreta' : a.title}, ${on ? 'desbloqueada' : 'bloqueada'}`
        return (
          <g
            key={a.id}
            transform={`translate(${p.x} ${p.y}) scale(${scale})`}
            className={clsx(styles.star, on && styles.on, active && styles.active, interactive && styles.interactive)}
            onMouseEnter={() => onHover?.(a.id)}
            onFocus={() => onHover?.(a.id)}
            onBlur={() => onHover?.(null)}
            onClick={() => onSelect?.(a.id)}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onSelect?.(a.id)
              }
            }}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? label : undefined}
          >
            {interactive && <circle r="22" className={styles.hit} />}
            {on && <circle r="26" fill={`url(#${gid}-glow)`} className={styles.glow} />}
            {active && <circle r="15" className={styles.ring} />}
            {hidden ? (
              <path d="M0 -6 L6 0 L0 6 L-6 0 Z" className={styles.secret} />
            ) : on ? (
              <path d="M0 -9 C1.2 -2.2 2.2 -1.2 9 0 C2.2 1.2 1.2 2.2 0 9 C-1.2 2.2 -2.2 1.2 -9 0 C-2.2 -1.2 -1.2 -2.2 0 -9 Z" className={styles.core} />
            ) : (
              <circle r="3.6" className={styles.dim} />
            )}
          </g>
        )
      })}
    </svg>
  )
}
