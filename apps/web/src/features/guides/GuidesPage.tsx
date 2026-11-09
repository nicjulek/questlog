import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { errorMessage } from '../../lib/api'
import { plural, relative } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { useGuides } from './hooks'
import styles from './GuidesPage.module.css'

export default function GuidesPage() {
  usePageTitle('Guias')
  const guides = useGuides()
  const list = guides.data ?? []
  const published = list.filter((g) => g.published).length

  return (
    <>
      <header className={styles.head}>
        <h1>Guias</h1>
        {list.length > 0 && (
          <p>
            {plural(list.length, 'guia escrito', 'guias escritos')}, {plural(published, 'publicado', 'publicados')}.
          </p>
        )}
      </header>
      {guides.isPending ? (
        <Skeleton height={80} count={3} />
      ) : guides.isError ? (
        <ErrorState message={errorMessage(guides.error)} onRetry={() => guides.refetch()} />
      ) : !list.length ? (
        <EmptyState title="Nenhum guia escrito" action={<ButtonLink to="/">Escolher um jogo</ButtonLink>}>
          Abra um jogo da sua biblioteca e use a aba Guias para escrever o primeiro.
        </EmptyState>
      ) : (
        <ul className={styles.list}>
          {list.map((g) => (
            <li key={g.id}>
              <Link to={`/guias/${g.id}/editar`} className={styles.item}>
                <span className={styles.game}>{g.gameTitle}</span>
                <span className={styles.title}>{g.title}</span>
                <span className={styles.meta}>
                  <span className={g.published ? styles.pub : styles.draft}>{g.published ? 'Publicado' : 'Rascunho'}</span>
                  editado {relative(g.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
