import { percent } from '../../lib/format'
import styles from './Progress.module.css'

export function ProgressBar({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = percent(value, total)
  return (
    <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label ?? 'Progresso de conquistas'}>
      <span style={{ width: `${pct}%` }} className={pct === 100 ? styles.full : undefined} />
    </div>
  )
}
