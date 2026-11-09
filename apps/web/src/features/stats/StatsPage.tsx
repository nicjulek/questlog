import { Link } from 'react-router-dom'
import { GAME_STATUSES, STATUS_LABEL } from '@questlog/shared'
import { ProgressBar } from '../../components/ui/Progress'
import { ErrorState, Skeleton } from '../../components/ui/States'
import { errorMessage } from '../../lib/api'
import { formatShort, hours, nf, percent, plural } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { useStats } from './hooks'
import { UnlockCalendar } from './UnlockCalendar'
import styles from './StatsPage.module.css'

export default function StatsPage() {
  usePageTitle('Estatísticas')
  const stats = useStats()

  if (stats.isPending) return <Skeleton height={420} />
  if (stats.isError) return <ErrorState message={errorMessage(stats.error)} onRetry={() => stats.refetch()} />

  const s = stats.data
  const yearTotal = s.unlocksByDay.reduce((sum, d) => sum + d.total, 0)
  const statuses = GAME_STATUSES.filter((st) => s.byStatus[st] > 0)

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Estatísticas</h1>
        <p className={styles.story}>
          Você acendeu <strong>{nf.format(s.achievementsUnlocked)}</strong> de {nf.format(s.achievementsTotal)} estrelas em {plural(s.games, 'jogo', 'jogos')}
          {s.hours ? `, ao longo de ${hours(s.hours)}` : ''}.
          {s.perfectGames > 0 && <> {plural(s.perfectGames, 'constelação está completa', 'constelações estão completas')}.</>}
          {s.guides > 0 && <> Você escreveu {plural(s.guides, 'guia', 'guias')}.</>}
        </p>
      </header>

      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2>Conquistas por dia</h2>
          <p>{plural(yearTotal, 'conquista', 'conquistas')} nos últimos 12 meses</p>
        </div>
        <UnlockCalendar days={s.unlocksByDay} />
      </section>

      <div className={styles.cols}>
        <section className={styles.block}>
          <h2>Perto de completar</h2>
          {s.closest.length ? (
            <ul className={styles.closest}>
              {s.closest.map((g) => (
                <li key={g.id}>
                  <Link to={`/jogos/${g.id}`}>
                    <span className={styles.gName}>{g.title}</span>
                    <span className={styles.left}>{g.total - g.unlocked === 1 ? 'falta 1' : `faltam ${g.total - g.unlocked}`}</span>
                    <ProgressBar value={g.unlocked} total={g.total} label={`${g.title}: ${percent(g.unlocked, g.total)}%`} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Desbloqueie algumas conquistas e os jogos mais perto dos 100% aparecem aqui.</p>
          )}
        </section>

        <section className={styles.block}>
          <h2>Últimas conquistas</h2>
          {s.recent.length ? (
            <ol className={styles.recent}>
              {s.recent.map((r) => (
                <li key={r.id}>
                  <svg viewBox="-10 -10 20 20" aria-hidden="true">
                    <path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8 Z" />
                  </svg>
                  <div>
                    <p className={styles.rTitle}>{r.title}</p>
                    <p className={styles.rGame}>
                      <Link to={`/jogos/${r.gameId}`}>{r.gameTitle}</Link>, {formatShort(r.unlockedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.muted}>Nenhuma conquista desbloqueada ainda.</p>
          )}
        </section>
      </div>

      <section className={styles.block}>
        <h2>Biblioteca por status</h2>
        {s.games ? (
          <>
            <div className={styles.stack} role="img" aria-label={statuses.map((st) => `${STATUS_LABEL[st]}: ${s.byStatus[st]}`).join(', ')}>
              {statuses.map((st) => (
                <span key={st} style={{ flex: s.byStatus[st], background: `var(--st-${st})` }} />
              ))}
            </div>
            <ul className={styles.legend}>
              {statuses.map((st) => (
                <li key={st}>
                  <i style={{ background: `var(--st-${st})` }} />
                  {STATUS_LABEL[st]} <b>{s.byStatus[st]}</b>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.muted}>Sua biblioteca está vazia.</p>
        )}
      </section>
    </div>
  )
}
