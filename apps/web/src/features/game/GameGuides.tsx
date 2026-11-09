import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState, Skeleton } from '../../components/ui/States'
import { relative } from '../../lib/format'
import { useGuides } from '../guides/hooks'
import styles from './GameGuides.module.css'

export function GameGuides({ gameId }: { gameId: number }) {
  const guides = useGuides(gameId)
  if (guides.isPending) return <Skeleton height={72} count={2} />
  const list = guides.data ?? []
  if (!list.length)
    return (
      <EmptyState title="Nenhum guia ainda" action={<ButtonLink to={`/jogos/${gameId}/guias/novo`} icon="edit">Escrever guia</ButtonLink>}>
        Explique como conseguir uma conquista difícil. Você decide se ele aparece no seu perfil público.
      </EmptyState>
    )
  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {list.map((g) => (
          <li key={g.id}>
            <Link to={`/guias/${g.id}/editar`} className={styles.item}>
              <span className={styles.title}>{g.title}</span>
              <span className={g.published ? styles.pub : styles.draft}>{g.published ? 'Publicado' : 'Rascunho'}</span>
              <span className={styles.when}>editado {relative(g.updatedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink to={`/jogos/${gameId}/guias/novo`} variant="ghost" icon="plus">
        Escrever outro guia
      </ButtonLink>
    </div>
  )
}
