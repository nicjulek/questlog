import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { GAME_STATUSES, STATUS_LABEL, type GameStatus } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { errorMessage } from '../../lib/api'
import { plural } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { toast } from '../../stores/toast'
import { useMe } from '../auth/hooks'
import { GameCard } from './GameCard'
import { GameFormDialog } from './GameFormDialog'
import { useCreateGame, useGames } from './hooks'
import styles from './LibraryPage.module.css'

export function LibraryPage() {
  usePageTitle('Biblioteca')
  const { data: me } = useMe()
  const games = useGames()
  const create = useCreateGame()
  const navigate = useNavigate()
  const [status, setStatus] = useState<GameStatus | null>(null)
  const [query, setQuery] = useState('')
  const q = useDeferredValue(query.trim().toLowerCase())
  const [adding, setAdding] = useState(false)

  const all = useMemo(() => games.data ?? [], [games.data])
  const counts = useMemo(() => {
    const c = Object.fromEntries(GAME_STATUSES.map((s) => [s, 0])) as Record<GameStatus, number>
    all.forEach((g) => c[g.status]++)
    return c
  }, [all])
  const visible = all.filter((g) => (!status || g.status === status) && (!q || g.title.toLowerCase().includes(q)))
  const unlocked = all.reduce((s, g) => s + g.achievementsUnlocked, 0)

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className={styles.hello}>Olá, {me?.displayName}</p>
          <h1>Biblioteca</h1>
          {all.length > 0 && (
            <p className={styles.sum}>
              {plural(all.length, 'jogo', 'jogos')} e {plural(unlocked, 'estrela acesa', 'estrelas acesas')}.
            </p>
          )}
        </div>
        <Button icon="plus" onClick={() => setAdding(true)}>
          Adicionar jogo
        </Button>
      </header>

      {all.length > 0 && (
        <div className={styles.filters}>
          <div className={styles.chips} role="radiogroup" aria-label="Filtrar por status">
            <button type="button" role="radio" aria-checked={status === null} className={clsx(styles.chip, status === null && styles.on)} onClick={() => setStatus(null)}>
              Todos <span>{all.length}</span>
            </button>
            {GAME_STATUSES.filter((s) => counts[s] > 0).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={status === s}
                className={clsx(styles.chip, status === s && styles.on)}
                style={{ '--c': `var(--st-${s})` } as React.CSSProperties}
                onClick={() => setStatus(status === s ? null : s)}
              >
                {STATUS_LABEL[s]} <span>{counts[s]}</span>
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <Icon name="search" size={18} />
            <span className="sr-only">Buscar jogo</span>
            <input type="search" placeholder="Buscar jogo" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
      )}

      {games.isPending ? (
        <div className={styles.grid}>
          <Skeleton height={280} count={6} />
        </div>
      ) : games.isError ? (
        <ErrorState message={errorMessage(games.error)} onRetry={() => games.refetch()} />
      ) : all.length === 0 ? (
        <EmptyState title="Seu céu ainda está vazio" action={<Button icon="plus" onClick={() => setAdding(true)}>Adicionar o primeiro jogo</Button>}>
          Adicione um jogo e cadastre as conquistas dele. Cada conquista desbloqueada acende uma estrela.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState title="Nenhum jogo encontrado" action={<Button variant="ghost" onClick={() => { setStatus(null); setQuery('') }}>Limpar filtros</Button>}>
          Nada combina com esse filtro.
        </EmptyState>
      ) : (
        <ul className={styles.grid}>
          {visible.map((g) => (
            <li key={g.id}>
              <GameCard game={g} />
            </li>
          ))}
        </ul>
      )}

      <GameFormDialog
        open={adding}
        onClose={() => setAdding(false)}
        submitLabel="Adicionar jogo"
        pending={create.isPending}
        error={create.error}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: (g) => {
              setAdding(false)
              toast(`${g.title} entrou na biblioteca`)
              navigate(`/jogos/${g.id}`)
            }
          })
        }
      />
    </>
  )
}
