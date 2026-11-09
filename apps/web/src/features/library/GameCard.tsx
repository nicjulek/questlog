import { Link } from 'react-router-dom'
import type { Game } from '@questlog/shared'
import { Cover } from '../../components/ui/Cover'
import { ProgressBar } from '../../components/ui/Progress'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { hours, relative } from '../../lib/format'
import styles from './GameCard.module.css'

export function GameCard({ game }: { game: Game }) {
  const total = game.achievementsTotal
  const done = game.achievementsUnlocked
  const perfect = total > 0 && done === total
  return (
    <Link to={`/jogos/${game.id}`} className={styles.card}>
      <Cover title={game.title} coverUrl={game.coverUrl} total={total} unlocked={done} />
      <div className={styles.body}>
        <div className={styles.top}>
          <h3>{game.title}</h3>
          <StatusBadge status={game.status} />
        </div>
        {total > 0 ? (
          <div className={styles.progress}>
            <ProgressBar value={done} total={total} label={`${done} de ${total} conquistas`} />
            <span className={perfect ? styles.perfect : undefined}>
              {done}/{total}
            </span>
          </div>
        ) : (
          <p className={styles.none}>Nenhuma conquista cadastrada</p>
        )}
        <p className={styles.meta}>
          {game.platform}
          {game.hours ? `, ${hours(game.hours)}` : ''}
          {game.lastUnlockedAt && <span> · última conquista {relative(game.lastUnlockedAt)}</span>}
        </p>
      </div>
    </Link>
  )
}
