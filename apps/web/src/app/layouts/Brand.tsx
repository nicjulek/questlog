import { Link } from 'react-router-dom'
import styles from './Brand.module.css'

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className={styles.brand} aria-label="Questlog, ir para o início">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 23 L13 15 L23 19" />
        <circle cx="5" cy="23" r="2.6" />
        <circle cx="13" cy="15" r="3.2" />
        <circle cx="23" cy="19" r="2.2" />
        <circle cx="25" cy="7" r="1.8" className={styles.off} />
      </svg>
      Questlog
    </Link>
  )
}
