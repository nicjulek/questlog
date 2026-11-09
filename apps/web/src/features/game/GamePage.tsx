import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import type { Achievement } from '@questlog/shared'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Constellation } from '../../components/ui/Constellation'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { skyGradient } from '../../lib/constellation'
import { ApiError, errorMessage } from '../../lib/api'
import { formatDate, formatShort, hours, percent, plural } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { toast } from '../../stores/toast'
import { GameFormDialog } from '../library/GameFormDialog'
import { GameGuides } from './GameGuides'
import { AchievementRow } from './AchievementRow'
import { BulkAddDialog, EditAchievementDialog } from './AchievementDialogs'
import { useAddAchievement, useDeleteGame, useGame, useToggleAchievement, useUpdateGame } from './hooks'
import styles from './GamePage.module.css'

type Tab = 'conquistas' | 'guias' | 'anotacoes'
type Filter = 'todas' | 'pendentes' | 'feitas'

export function GamePage() {
  const id = Number(useParams().gameId)
  const game = useGame(id)
  const navigate = useNavigate()
  const toggle = useToggleAchievement(id)
  const add = useAddAchievement(id)
  const update = useUpdateGame(id)
  const remove = useDeleteGame(id)

  const [tab, setTab] = useState<Tab>('conquistas')
  const [filter, setFilter] = useState<Filter>('todas')
  const [revealSecrets, setRevealSecrets] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [flash, setFlash] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editGame, setEditGame] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const rows = useRef(new Map<number, HTMLLIElement>())
  const narrow = useMediaQuery('(max-width: 640px)')
  const touch = useMediaQuery('(hover: none)')

  usePageTitle(game.data?.title)

  const list = useMemo(() => game.data?.achievements ?? [], [game.data])
  const shown = list.filter((a) => (filter === 'todas' ? true : filter === 'feitas' ? !!a.unlockedAt : !a.unlockedAt))
  const hoveredA = list.find((a) => a.id === hovered)

  if (game.isPending) {
    return (
      <div className={styles.loading}>
        <Skeleton height={380} />
        <Skeleton height={64} count={4} />
      </div>
    )
  }
  if (game.isError) {
    if (game.error instanceof ApiError && game.error.status === 404) return <GameNotFound />
    return <ErrorState message={errorMessage(game.error)} onRetry={() => game.refetch()} />
  }

  const g = game.data
  const done = g.achievementsUnlocked
  const total = g.achievementsTotal
  const perfect = total > 0 && done === total

  const selectStar = (aid: number) => {
    setTab('conquistas')
    setFilter('todas')
    requestAnimationFrame(() => {
      rows.current.get(aid)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setFlash(aid)
      setTimeout(() => setFlash(null), 1200)
    })
  }

  const onToggle = (a: Achievement) => {
    const unlocked = !a.unlockedAt
    toggle.mutate({ id: a.id, unlocked }, { onError: (e) => toast(errorMessage(e), 'error') })
    if (unlocked && done + 1 === total) toast(`Constelação completa! ${g.title} está 100%`)
  }

  const addOne = (e: FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    add.mutate({ title }, { onSuccess: () => setNewTitle(''), onError: (err) => toast(errorMessage(err), 'error') })
  }

  const caption = hoveredA
    ? hoveredA.unlockedAt
      ? `${hoveredA.title}, acesa em ${formatDate(hoveredA.unlockedAt)}`
      : hoveredA.secret && !revealSecrets
        ? 'Conquista secreta, ainda apagada'
        : `${hoveredA.title}, ainda apagada`
    : total
      ? touch
        ? 'Toque numa estrela para ir até a conquista.'
        : 'Passe o mouse ou use Tab para ver cada estrela. Clique para ir até a conquista.'
      : ''

  return (
    <article className={styles.page}>
      <Link to="/" className={styles.back}>
        <Icon name="back" size={18} /> Biblioteca
      </Link>

      <section className={styles.hero} style={{ backgroundImage: skyGradient(g.title) }}>
        <div className={styles.heroTop}>
          <div className={styles.titles}>
            <h1>{g.title}</h1>
            <div className={styles.meta}>
              <StatusBadge status={g.status} />
              <span>{g.platform}</span>
              {g.hours ? <span>{hours(g.hours)} jogadas</span> : null}
              {g.rating ? <span>Nota {g.rating}/10</span> : null}
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditGame(true)}>
              Editar
            </Button>
            <Button variant="ghost" size="sm" icon="trash" iconOnly onClick={() => setConfirmDelete(true)}>
              Excluir jogo
            </Button>
          </div>
        </div>

        {total > 0 ? (
          <>
            <Constellation
              seed={g.title}
              achievements={list}
              variant={narrow ? 'compact' : 'hero'}
              activeId={hovered}
              onHover={setHovered}
              onSelect={selectStar}
              className={styles.sky}
            />
            <div className={styles.heroFoot}>
              <p className={clsx(styles.count, perfect && styles.perfect)}>
                <strong>{done}</strong> de {total} estrelas acesas
                <span>{percent(done, total)}%</span>
              </p>
              <p className={styles.caption} aria-live="polite">
                {caption}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.noStars}>
            <p>Este céu ainda não tem estrelas. Cadastre as conquistas do jogo para montar a constelação.</p>
            <Button icon="list" onClick={() => setBulkOpen(true)}>
              Colar lista de conquistas
            </Button>
          </div>
        )}
      </section>

      <div className={styles.tabs} role="tablist" aria-label="Seções do jogo">
        {(
          [
            ['conquistas', `Conquistas${total ? ` ${total}` : ''}`],
            ['guias', 'Guias'],
            ['anotacoes', 'Anotações']
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button key={key} type="button" role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} className={clsx(styles.tab, tab === key && styles.tabOn)} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'conquistas' && (
        <section id="panel-conquistas" role="tabpanel" aria-labelledby="tab-conquistas">
          <div className={styles.toolbar}>
            <div className={styles.seg} role="radiogroup" aria-label="Mostrar">
              {(
                [
                  ['todas', 'Todas'],
                  ['pendentes', 'Faltando'],
                  ['feitas', 'Desbloqueadas']
                ] as [Filter, string][]
              ).map(([k, l]) => (
                <button key={k} type="button" role="radio" aria-checked={filter === k} onClick={() => setFilter(k)}>
                  {l}
                </button>
              ))}
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={revealSecrets} onChange={(e) => setRevealSecrets(e.target.checked)} />
              <Icon name={revealSecrets ? 'eye' : 'eyeOff'} size={18} />
              Mostrar secretas
            </label>
          </div>

          <form className={styles.addRow} onSubmit={addOne}>
            <label htmlFor="nova-conquista" className="sr-only">
              Nova conquista
            </label>
            <input id="nova-conquista" placeholder="Adicionar conquista" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={120} />
            <Button type="submit" size="sm" icon="plus" loading={add.isPending} disabled={!newTitle.trim()}>
              Adicionar
            </Button>
            <Button size="sm" variant="ghost" icon="list" onClick={() => setBulkOpen(true)}>
              Colar lista
            </Button>
          </form>

          {shown.length ? (
            <ol className={styles.list}>
              {shown.map((a) => (
                <AchievementRow
                  key={a.id}
                  ref={(el) => {
                    if (el) rows.current.set(a.id, el)
                    else rows.current.delete(a.id)
                  }}
                  achievement={a}
                  revealSecrets={revealSecrets}
                  active={hovered === a.id}
                  flash={flash === a.id}
                  onToggle={() => onToggle(a)}
                  onEdit={() => setEditing(a)}
                  onHover={setHovered}
                />
              ))}
            </ol>
          ) : total ? (
            <p className={styles.filtered}>{filter === 'feitas' ? 'Nenhuma conquista desbloqueada ainda.' : 'Todas desbloqueadas. Parabéns!'}</p>
          ) : null}
        </section>
      )}

      {tab === 'guias' && (
        <section id="panel-guias" role="tabpanel" aria-labelledby="tab-guias">
          <GameGuides gameId={g.id} />
        </section>
      )}

      {tab === 'anotacoes' && (
        <section id="panel-anotacoes" role="tabpanel" aria-labelledby="tab-anotacoes" className={styles.notes}>
          {g.notes ? (
            <p className={styles.noteText}>{g.notes}</p>
          ) : (
            <EmptyState title="Sem anotações" action={<Button variant="ghost" icon="edit" onClick={() => setEditGame(true)}>Escrever anotação</Button>}>
              Guarde onde parou, o que falta ou uma dica para você mesmo.
            </EmptyState>
          )}
          {g.notes && (
            <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditGame(true)}>
              Editar anotações
            </Button>
          )}
          <p className={styles.dates}>
            Na biblioteca desde {formatShort(g.createdAt)}
            {g.lastUnlockedAt && `, última conquista em ${formatDate(g.lastUnlockedAt)}`}.
          </p>
        </section>
      )}

      <EditAchievementDialog gameId={g.id} achievement={editing} onClose={() => setEditing(null)} />
      <BulkAddDialog gameId={g.id} open={bulkOpen} onClose={() => setBulkOpen(false)} />
      <GameFormDialog
        open={editGame}
        onClose={() => setEditGame(false)}
        initial={g}
        submitLabel="Salvar alterações"
        pending={update.isPending}
        error={update.error}
        onSubmit={(input) => update.mutate(input, { onSuccess: () => { setEditGame(false); toast('Jogo atualizado') } })}
      />
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Excluir ${g.title}?`} description={`${plural(total, 'conquista', 'conquistas')} e os guias deste jogo também serão excluídos. Não dá para desfazer.`} width={460}>
        <div className={styles.confirmActions}>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Manter jogo
          </Button>
          <Button
            variant="danger"
            icon="trash"
            loading={remove.isPending}
            onClick={() =>
              remove.mutate(undefined, {
                onSuccess: () => {
                  toast(`${g.title} saiu da biblioteca`)
                  navigate('/')
                },
                onError: (e) => toast(errorMessage(e), 'error')
              })
            }
          >
            Excluir jogo
          </Button>
        </div>
      </Dialog>
    </article>
  )
}

function GameNotFound() {
  return <EmptyState title="Jogo não encontrado" action={<ButtonLink to="/">Voltar à biblioteca</ButtonLink>} />
}
