import { issuesToFields } from '../../lib/formErrors'
import { useState, type FormEvent } from 'react'
import { achievementSchema, parseBulkAchievements, type Achievement } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { FormError, TextArea, TextField } from '../../components/ui/Field'
import { errorMessage } from '../../lib/api'
import { plural } from '../../lib/format'
import { toast } from '../../stores/toast'
import { useBulkAdd, useDeleteAchievement, useUpdateAchievement } from './hooks'
import styles from './AchievementDialogs.module.css'

const toLocalDate = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EditAchievementDialog({ gameId, achievement, onClose }: { gameId: number; achievement: Achievement | null; onClose: () => void }) {
  const update = useUpdateAchievement(gameId)
  const remove = useDeleteAchievement(gameId)
  const [form, setForm] = useState({ title: '', description: '', secret: false, date: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState(false)
  const [loadedId, setLoadedId] = useState<number | null>(null)
  if (achievement && achievement.id !== loadedId) {
    setLoadedId(achievement.id)
    setForm({ title: achievement.title, description: achievement.description ?? '', secret: achievement.secret, date: toLocalDate(achievement.unlockedAt) })
    setErrors({})
    setConfirm(false)
  }
  if (!achievement && loadedId !== null) setLoadedId(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!achievement) return
    const unlockedAt = form.date ? new Date(`${form.date}T12:00:00`).toISOString() : null
    const parsed = achievementSchema.safeParse({ title: form.title, description: form.description, secret: form.secret, unlockedAt })
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    update.mutate({ id: achievement.id, ...parsed.data }, { onSuccess: () => { toast('Conquista atualizada'); onClose() } })
  }

  return (
    <Dialog open={!!achievement} onClose={onClose} title="Editar conquista">
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField label="Nome" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
        <TextArea label="Como conseguir" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} />
        <div className={styles.row}>
          <TextField label="Desbloqueada em" type="date" value={form.date} max={toLocalDate(new Date().toISOString())} onChange={(e) => setForm({ ...form, date: e.target.value })} hint="Deixe vazio se ainda não conseguiu." />
          <label className={styles.check}>
            <input type="checkbox" checked={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.checked })} />
            <span>
              <strong>Conquista secreta</strong>
              <small>Esconde o nome enquanto estiver bloqueada.</small>
            </span>
          </label>
        </div>
        <FormError>{(update.error || remove.error) && errorMessage(update.error ?? remove.error)}</FormError>
        <div className={styles.actions}>
          {confirm ? (
            <span className={styles.confirm}>
              Excluir esta conquista?
              <Button variant="danger" size="sm" loading={remove.isPending} onClick={() => achievement && remove.mutate(achievement.id, { onSuccess: () => { toast('Conquista excluída'); onClose() } })}>
                Excluir
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setConfirm(false)}>
                Manter
              </Button>
            </span>
          ) : (
            <Button variant="quiet" icon="trash" onClick={() => setConfirm(true)}>
              Excluir
            </Button>
          )}
          <span className={styles.spacer} />
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={update.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export function BulkAddDialog({ gameId, open, onClose }: { gameId: number; open: boolean; onClose: () => void }) {
  const bulk = useBulkAdd(gameId)
  const [text, setText] = useState('')
  const preview = parseBulkAchievements(text)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!preview.length) return
    bulk.mutate(text, {
      onSuccess: (list) => {
        toast(`${plural(list.length, 'conquista adicionada', 'conquistas adicionadas')}`)
        setText('')
        onClose()
      }
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Colar lista de conquistas"
      description="Uma por linha. Use um traço para separar a descrição e comece com * para marcar como secreta."
      width={620}
    >
      <form className={styles.form} onSubmit={submit}>
        <TextArea
          label="Conquistas"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Levado em 60 segundos - Morra em 60 segundos após acordar\nBem apertado - Use seu traje de forma inapropriada\n* Convergência - Pegue todos os instrumentos'}
          className={styles.mono}
        />
        <p className={styles.count}>{preview.length ? `${plural(preview.length, 'conquista', 'conquistas')} prontas para adicionar.` : 'Nada para adicionar ainda.'}</p>
        <FormError>{bulk.error && errorMessage(bulk.error)}</FormError>
        <div className={styles.actions}>
          <span className={styles.spacer} />
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={bulk.isPending} disabled={!preview.length}>
            Adicionar {preview.length || ''}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
