import clsx from 'clsx'
import { useToasts } from '../../stores/toast'
import { Icon } from './Icon'
import styles from './Toaster.module.css'

export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  return (
    <div className={styles.region} aria-live="polite">
      {toasts.map((t) => (
        <p key={t.id} className={clsx(styles.toast, t.tone === 'error' && styles.error)}>
          <Icon name={t.tone === 'error' ? 'close' : 'star'} size={16} />
          {t.text}
        </p>
      ))}
    </div>
  )
}
