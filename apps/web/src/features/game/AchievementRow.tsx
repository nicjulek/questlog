import { forwardRef, useState } from 'react'
import clsx from 'clsx'
import type { Achievement } from '@questlog/shared'
import { Icon } from '../../components/ui/Icon'
import { formatDate } from '../../lib/format'
import styles from './AchievementRow.module.css'

type Props = {
  achievement: Achievement
  revealSecrets: boolean
  active: boolean
  flash: boolean
  onToggle: () => void
  onEdit: () => void
  onHover: (id: number | null) => void
}

export const AchievementRow = forwardRef<HTMLLIElement, Props>(function AchievementRow({ achievement: a, revealSecrets, active, flash, onToggle, onEdit, onHover }, ref) {
  const [peek, setPeek] = useState(false)
  const on = !!a.unlockedAt
  const hidden = a.secret && !on && !revealSecrets && !peek

  return (
    <li
      ref={ref}
      className={clsx(styles.row, on && styles.on, active && styles.active, flash && styles.flash)}
      onMouseEnter={() => onHover(a.id)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        className={styles.check}
        onClick={onToggle}
        aria-pressed={on}
        aria-label={on ? `Marcar ${hidden ? 'conquista secreta' : a.title} como bloqueada` : `Desbloquear ${hidden ? 'conquista secreta' : a.title}`}
        onFocus={() => onHover(a.id)}
        onBlur={() => onHover(null)}
      >
        <svg viewBox="-12 -12 24 24" aria-hidden="true">
          {on ? <path d="M0 -9 C1.2 -2.2 2.2 -1.2 9 0 C2.2 1.2 1.2 2.2 0 9 C-1.2 2.2 -2.2 1.2 -9 0 C-2.2 -1.2 -1.2 -2.2 0 -9 Z" /> : <circle r="3" />}
        </svg>
      </button>

      <div className={styles.text}>
        {hidden ? (
          <>
            <p className={styles.title}>Conquista secreta</p>
            <button type="button" className={styles.reveal} onClick={() => setPeek(true)}>
              Mostrar spoiler
            </button>
          </>
        ) : (
          <>
            <p className={styles.title}>
              {a.title}
              {a.secret && <span className={styles.secretTag}>secreta</span>}
            </p>
            {a.description && <p className={styles.desc}>{a.description}</p>}
          </>
        )}
      </div>

      <div className={styles.side}>
        {on && <time dateTime={a.unlockedAt!}>{formatDate(a.unlockedAt!)}</time>}
        <button type="button" className={styles.edit} onClick={onEdit} aria-label={`Editar ${hidden ? 'conquista secreta' : a.title}`}>
          <Icon name="edit" size={16} />
        </button>
      </div>
    </li>
  )
})
