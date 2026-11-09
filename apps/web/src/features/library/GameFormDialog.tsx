import { issuesToFields } from '../../lib/formErrors'
import { useState, type FormEvent } from 'react'
import { GAME_STATUSES, PLATFORMS, STATUS_LABEL, gameSchema, type Game, type GameInput } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { FormError, SelectField, TextArea, TextField } from '../../components/ui/Field'
import { errorMessage, fieldErrors } from '../../lib/api'
import styles from './GameFormDialog.module.css'

type Props = {
  open: boolean
  onClose: () => void
  initial?: Partial<Game>
  submitLabel: string
  pending: boolean
  error: unknown
  onSubmit: (input: GameInput) => void
}

const toForm = (g?: Partial<Game>) => ({
  title: g?.title ?? '',
  platform: g?.platform ?? 'PC',
  status: g?.status ?? 'playing',
  hours: g?.hours != null ? String(g.hours) : '',
  rating: g?.rating != null ? String(g.rating) : '',
  coverUrl: g?.coverUrl ?? '',
  notes: g?.notes ?? ''
})

export function GameFormDialog({ open, onClose, initial, submitLabel, pending, error, onSubmit }: Props) {
  const [form, setForm] = useState(() => toForm(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setForm(toForm(initial))
      setErrors({})
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = gameSchema.safeParse({
      ...form,
      hours: form.hours === '' ? null : Number(form.hours.replace(',', '.')),
      rating: form.rating === '' ? null : Number(form.rating)
    })
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  const all = { ...fieldErrors(error), ...errors }

  return (
    <Dialog open={open} onClose={onClose} title={initial?.id ? 'Editar jogo' : 'Adicionar jogo'} width={600}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField label="Nome do jogo" value={form.title} onChange={set('title')} error={all.title} autoFocus placeholder="Hollow Knight" />
        <div className={styles.row}>
          <SelectField label="Status" value={form.status} onChange={set('status')}>
            {GAME_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </SelectField>
          <SelectField label="Plataforma" value={form.platform} onChange={set('platform')}>
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </SelectField>
        </div>
        <div className={styles.row}>
          <TextField label="Horas jogadas" inputMode="decimal" value={form.hours} onChange={set('hours')} error={all.hours} placeholder="0" />
          <SelectField label="Nota" value={form.rating} onChange={set('rating')}>
            <option value="">Sem nota</option>
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
              <option key={n} value={n}>
                {n} de 10
              </option>
            ))}
          </SelectField>
        </div>
        <TextField label="Link da capa" type="url" value={form.coverUrl} onChange={set('coverUrl')} error={all.coverUrl} placeholder="https://" hint="Opcional. Sem capa, o jogo ganha um céu com a constelação das conquistas." />
        <TextArea label="Anotações" value={form.notes} onChange={set('notes')} rows={3} placeholder="O que falta, onde parou, dicas para você mesmo." />
        <FormError>{error && Object.keys(fieldErrors(error)).length === 0 ? errorMessage(error) : null}</FormError>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
