import { Link, useParams } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/Button'
import { Cover } from '../../components/ui/Cover'
import { EmptyState, Skeleton } from '../../components/ui/States'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDate, hours, nf, plural } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { useProfile } from './hooks'
import styles from './PublicProfilePage.module.css'

export default function PublicProfilePage() {
  const { username = '' } = useParams()
  const profile = useProfile(username)
  usePageTitle(profile.data?.user.displayName)

  if (profile.isPending) return <Skeleton height={420} />
  if (profile.isError)
    return (
      <EmptyState title="Perfil não encontrado" action={<ButtonLink to="/">Ir para o início</ButtonLink>}>
        Confira se o nome de usuário está certo.
      </EmptyState>
    )

  const { user, totals, showcase, guides } = profile.data
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {user.displayName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h1>{user.displayName}</h1>
          <p className={styles.handle}>@{user.username}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
          <p className={styles.totals}>
            <b>{nf.format(totals.achievementsUnlocked)}</b> estrelas acesas em {plural(totals.games, 'jogo', 'jogos')}
            {totals.hours ? `, ${hours(totals.hours)} jogadas` : ''}
            {totals.perfectGames ? `, ${plural(totals.perfectGames, 'constelação completa', 'constelações completas')}` : ''}.
          </p>
        </div>
      </header>

      {showcase.length > 0 && (
        <section>
          <h2 className={styles.h2}>Constelações</h2>
          <ul className={styles.grid}>
            {showcase.map((g) => (
              <li key={g.id} className={styles.card}>
                <Cover title={g.title} coverUrl={g.coverUrl} total={g.achievementsTotal} unlocked={g.achievementsUnlocked} />
                <div className={styles.cardBody}>
                  <h3>{g.title}</h3>
                  <StatusBadge status={g.status} />
                </div>
                {g.achievementsTotal > 0 && (
                  <p className={styles.count}>
                    {g.achievementsUnlocked} de {g.achievementsTotal} conquistas
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className={styles.h2}>Guias</h2>
        {guides.length ? (
          <ul className={styles.guides}>
            {guides.map((g) => (
              <li key={g.id}>
                <Link to={`/u/${user.username}/guias/${g.slug}`}>
                  <span className={styles.gGame}>{g.gameTitle}</span>
                  <span className={styles.gTitle}>{g.title}</span>
                  <span className={styles.gDate}>{formatDate(g.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Nenhum guia publicado ainda.</p>
        )}
      </section>

      <p className={styles.since}>No Questlog desde {formatDate(user.memberSince)}.</p>
    </div>
  )
}
