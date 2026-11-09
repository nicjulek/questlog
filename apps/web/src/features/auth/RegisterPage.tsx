import { issuesToFields } from '../../lib/formErrors'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { FormError, TextField } from '../../components/ui/Field'
import { errorMessage, fieldErrors } from '../../lib/api'
import { usePageTitle } from '../../lib/usePageTitle'
import { toast } from '../../stores/toast'
import { AuthShell } from './AuthShell'
import { useRegister } from './hooks'
import styles from './forms.module.css'

export function RegisterPage() {
  usePageTitle('Criar conta')
  const register = useRegister()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = registerSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    setErrors({})
    register.mutate(parsed.data, {
      onSuccess: (u) => {
        toast(`Boas-vindas, ${u.displayName}!`)
        navigate('/', { replace: true })
      },
      onError: (err) => setErrors(fieldErrors(err))
    })
  }

  const serverFields = Object.keys(fieldErrors(register.error)).length > 0

  return (
    <AuthShell
      title="Criar conta"
      lead="Monte sua biblioteca e acompanhe cada conquista."
      footer={
        <>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField label="Como quer ser chamado" name="displayName" autoComplete="nickname" value={form.displayName} onChange={set('displayName')} error={errors.displayName} />
        <TextField label="Usuário" name="username" autoComplete="username" autoCapitalize="none" value={form.username} onChange={set('username')} error={errors.username} hint="Aparece no endereço do seu perfil público." />
        <TextField label="Senha" name="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Pelo menos 8 caracteres." />
        <FormError>{register.error && !serverFields && errorMessage(register.error)}</FormError>
        <Button type="submit" loading={register.isPending}>
          {register.isPending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthShell>
  )
}
