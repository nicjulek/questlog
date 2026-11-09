import { useState } from 'react'
import clsx from 'clsx'
import type { Achievement } from '@questlog/shared'
import { skyGradient } from '../../lib/constellation'
import { Constellation } from './Constellation'
import styles from './Cover.module.css'

type Props = {
  title: string
  coverUrl?: string | null
  total: number
  unlocked: number
  achievements?: Pick<Achievement, 'id' | 'title' | 'secret' | 'unlockedAt'>[]
  className?: string
}

function placeholder(total: number, unlocked: number) {
  return Array.from({ length: total }, (_, i) => ({ id: i, title: '', secret: false, unlockedAt: i < unlocked ? 'x' : null }))
}

export function Cover({ title, coverUrl, total, unlocked, achievements, className }: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = coverUrl && !failed
  const stars = achievements ?? placeholder(Math.min(total, 40), Math.round((unlocked / Math.max(1, total)) * Math.min(total, 40)))
  return (
    <div className={clsx(styles.cover, className)} style={{ backgroundImage: skyGradient(title) }}>
      {showImage ? (
        <img src={coverUrl} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <>
          {stars.length > 0 ? (
            <Constellation seed={title} achievements={stars} className={styles.stars} />
          ) : (
            <span className={styles.empty} aria-hidden="true" />
          )}
          <span className={styles.title} aria-hidden="true">
            {title}
          </span>
        </>
      )}
    </div>
  )
}
