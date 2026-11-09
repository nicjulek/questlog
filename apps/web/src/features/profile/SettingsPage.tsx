import { issuesToFields } from '../../lib/formErrors'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { profileSchema } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { FormError, TextArea, TextField } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { errorMessage } from '../../lib/api'
import { usePageTitle } from '../../lib/usePageTitle'
import { toast } from '../../stores/toast'
import { useMe, useUpdateProfile } from '../auth/hooks'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  usePageTitle('Conta')
  const { data: me } = useMe()
  const update = useUpdateProfile()
  const [form, setForm] = useState({ displayName: me?.displayName ?? '', bio: me?.bio ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const url = me ? `${window.location.origin}/u/${me.username}` : ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = profileSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    setErrors({})
    update.mutate(parsed.data, { onSuccess: () => toast('Perfil atualizado') })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copiado')
    } catch {
      toast('Não foi possível copiar. Selecione o link e copie manualmente.', 'error')
    }
  }

  return (
    <div className={styles.page}>
      <h1>Conta</h1>

      <section className={styles.block}>
        <h2>Perfil público</h2>
        <p className={styles.muted}>Mostra seus jogos com mais conquistas e os guias que você publicou.</p>
        <div className={styles.url}>
          <code>{url}</code>
          <Button size="sm" variant="ghost" icon="link" onClick={copy}>
            Copiar link
          </Button>
          <Link to={`/u/${me?.username}`} className={styles.open}>
            Abrir <Icon name="external" size={15} />
          </Link>
        </div>
      </section>

      <form className={styles.block} onSubmit={submit} noValidate>
        <h2>Seus dados</h2>
        <TextField label="Usuário" value={me?.username ?? ''} disabled hint="O nome de usuário não pode ser alterado." />
        <TextField label="Como quer ser chamado" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} error={errors.displayName} />
        <TextArea label="Bio" rows={3} maxLength={280} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} error={errors.bio} hint={`${form.bio.length}/280`} />
        <FormError>{update.error && errorMessage(update.error)}</FormError>
        <div>
          <Button type="submit" loading={update.isPending}>
            Salvar perfil
          </Button>
        </div>
      </form>
    </div>
  )
}
