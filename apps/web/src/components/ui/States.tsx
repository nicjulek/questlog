import type { ReactNode } from 'react'
import styles from './States.module.css'

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <svg viewBox="0 0 120 60" aria-hidden="true" className={styles.art}>
        <path d="M14 44 L44 22 L70 34 L104 14" />
        <circle cx="14" cy="44" r="3" />
        <circle cx="44" cy="22" r="3" />
        <circle cx="70" cy="34" r="3" />
        <circle cx="104" cy="14" r="3" />
      </svg>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.empty} role="alert">
      <h2>Não foi possível carregar</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}

export function Skeleton({ height = 120, count = 1 }: { height?: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeleton} style={{ height }} aria-hidden="true" />
      ))}
    </>
  )
}
