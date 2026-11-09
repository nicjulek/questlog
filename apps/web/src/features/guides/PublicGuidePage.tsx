import { Link, useParams } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { EmptyState, Skeleton } from '../../components/ui/States'
import { formatDate } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { usePublicGuide } from './hooks'
import { RichTextView } from './RichText'
import styles from './PublicGuidePage.module.css'

export default function PublicGuidePage() {
  const { username = '', slug = '' } = useParams()
  const guide = usePublicGuide(username, slug)
  usePageTitle(guide.data?.title)

  if (guide.isPending) return <Skeleton height={420} />
  if (guide.isError)
    return (
      <EmptyState title="Guia não encontrado" action={<ButtonLink to={`/u/${username}`}>Ver perfil</ButtonLink>}>
        Ele pode ter sido despublicado ou o endereço mudou.
      </EmptyState>
    )

  const g = guide.data
  return (
    <article className={styles.page}>
      <Link to={`/u/${g.author.username}`} className={styles.back}>
        <Icon name="back" size={18} /> {g.author.displayName}
      </Link>
      <p className={styles.game}>{g.gameTitle}</p>
      <h1>{g.title}</h1>
      <p className={styles.byline}>
        Por {g.author.displayName}, atualizado em {formatDate(g.updatedAt)}
      </p>
      <div className={styles.body}>
        <RichTextView content={g.content} />
      </div>
    </article>
  )
}
