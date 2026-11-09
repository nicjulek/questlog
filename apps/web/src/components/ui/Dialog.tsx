import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Dialog.module.css'

type Props = { open: boolean; onClose: () => void; title: string; description?: ReactNode; children: ReactNode; width?: number }

export function Dialog({ open, onClose, title, description, children, width = 520 }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-labelledby="dialog-title"
    >
      {open && (
        <div className={styles.inner}>
          <header className={styles.head}>
            <div>
              <h2 id="dialog-title">{title}</h2>
              {description && <p className={styles.desc}>{description}</p>}
            </div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
              <Icon name="close" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
