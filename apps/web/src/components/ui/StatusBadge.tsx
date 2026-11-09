import { STATUS_LABEL, type GameStatus } from '@questlog/shared'
import styles from './StatusBadge.module.css'

export function StatusBadge({ status }: { status: GameStatus }) {
  return (
    <span className={styles.badge} style={{ '--c': `var(--st-${status})` } as React.CSSProperties}>
      {STATUS_LABEL[status]}
    </span>
  )
}
