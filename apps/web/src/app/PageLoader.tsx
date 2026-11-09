import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div className={styles.wrap} role="status">
      <svg viewBox="0 0 60 30" aria-hidden="true">
        <path d="M6 22 L22 10 L38 18 L54 6" />
        <circle cx="6" cy="22" r="2.5" />
        <circle cx="22" cy="10" r="2.5" />
        <circle cx="38" cy="18" r="2.5" />
        <circle cx="54" cy="6" r="2.5" />
      </svg>
      <span className="sr-only">Carregando</span>
    </div>
  )
}
