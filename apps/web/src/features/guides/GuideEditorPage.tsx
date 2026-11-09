import { issuesToFields } from '../../lib/formErrors'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { guideSchema } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { FormError } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { ErrorState, Skeleton } from '../../components/ui/States'
import { errorMessage, fieldErrors } from '../../lib/api'
import { relative } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { toast } from '../../stores/toast'
import { useMe } from '../auth/hooks'
import { useGame } from '../game/hooks'
import { useDeleteGuide, useGuide, useSaveGuide } from './hooks'
import { RichTextEditor } from './RichText'
import styles from './GuideEditorPage.module.css'

const EMPTY = { type: 'doc', content: [{ type: 'paragraph' }] }

export default function GuideEditorPage() {
  const params = useParams()
  const guideId = params.guideId ? Number(params.guideId) : null
  const existing = useGuide(guideId)
  const gameId = guideId ? existing.data?.gameId ?? 0 : Number(params.gameId)
  const game = useGame(gameId)
  const save = useSaveGuide(gameId, guideId)
  const remove = useDeleteGuide()
  const { data: me } = useMe()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState<Record<string, unknown> | null>(guideId ? null : EMPTY)
  const [published, setPublished] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  usePageTitle(guideId ? 'Editar guia' : 'Novo guia')

  useEffect(() => {
    if (existing.data && content === null) {
      setTitle(existing.data.title)
      setContent(existing.data.content)
      setPublished(existing.data.published)
    }
  }, [existing.data, content])

  const submit = (e?: FormEvent, publish = published) => {
    e?.preventDefault()
    const parsed = guideSchema.safeParse({ title, content, published: publish })
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    setErrors({})
    save.mutate(parsed.data, {
      onSuccess: (g) => {
        setPublished(g.published)
        setDirty(false)
        toast(g.published && !published ? 'Guia publicado' : 'Guia salvo')
        if (!guideId) navigate(`/guias/${g.id}/editar`, { replace: true })
      },
      onError: (err) => setErrors(fieldErrors(err))
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        document.getElementById('salvar-guia')?.click()
      }
    }
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [dirty])

  if (guideId && existing.isError) return <ErrorState message={errorMessage(existing.error)} />
  if (!content || (guideId && existing.isPending)) return <Skeleton height={480} />

  const publicUrl = existing.data && me ? `/u/${me.username}/guias/${existing.data.slug}` : null

  return (
    <form className={styles.page} onSubmit={submit} noValidate>
      <div className={styles.top}>
        <Link to={gameId ? `/jogos/${gameId}` : '/guias'} className={styles.back}>
          <Icon name="back" size={18} /> {game.data?.title ?? 'Voltar'}
        </Link>
        <div className={styles.actions}>
          <span className={styles.state} aria-live="polite">
            {save.isPending ? 'Salvando…' : dirty ? 'Alterações não salvas' : existing.data ? `Salvo ${relative(existing.data.updatedAt)}` : 'Rascunho novo'}
          </span>
          {published && publicUrl && (
            <Link to={publicUrl} className={styles.view} target="_blank">
              Ver página pública <Icon name="external" size={15} />
            </Link>
          )}
          <Button id="salvar-guia" type="submit" variant="ghost" loading={save.isPending && published}>
            Salvar
          </Button>
          <Button type="button" variant={published ? 'quiet' : 'primary'} onClick={() => submit(undefined, !published)} loading={save.isPending && !published}>
            {published ? 'Despublicar' : 'Publicar'}
          </Button>
        </div>
      </div>

      <label htmlFor="titulo-guia" className="sr-only">
        Título do guia
      </label>
      <input
        id="titulo-guia"
        className={styles.title}
        placeholder="Título do guia"
        value={title}
        maxLength={120}
        onChange={(e) => {
          setTitle(e.target.value)
          setDirty(true)
        }}
        aria-invalid={!!errors.title}
      />
      {errors.title && <p className={styles.err}>{errors.title}</p>}

      <RichTextEditor
        label="Conteúdo do guia"
        content={content}
        onChange={(json) => {
          setContent(json)
          setDirty(true)
        }}
      />

      <FormError>{save.error && !Object.keys(fieldErrors(save.error)).length ? errorMessage(save.error) : null}</FormError>

      <footer className={styles.foot}>
        <p>
          {published ? 'Publicado: qualquer pessoa com o link do seu perfil pode ler.' : 'Rascunho: só você vê.'} Atalho para salvar: Ctrl + S.
        </p>
        {guideId && (
          <Button variant="quiet" icon="trash" onClick={() => setConfirmDelete(true)}>
            Excluir guia
          </Button>
        )}
      </footer>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir este guia?" description="Não dá para desfazer." width={420}>
        <div className={styles.confirm}>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Manter
          </Button>
          <Button
            variant="danger"
            icon="trash"
            loading={remove.isPending}
            onClick={() =>
              guideId &&
              remove.mutate(guideId, {
                onSuccess: () => {
                  toast('Guia excluído')
                  navigate(gameId ? `/jogos/${gameId}` : '/guias')
                }
              })
            }
          >
            Excluir guia
          </Button>
        </div>
      </Dialog>
    </form>
  )
}
