import { issuesToFields } from '../../lib/formErrors'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginSchema } from '@questlog/shared'
import { Button } from '../../components/ui/Button'
import { FormError, TextField } from '../../components/ui/Field'
import { errorMessage } from '../../lib/api'
import { usePageTitle } from '../../lib/usePageTitle'
import { AuthShell } from './AuthShell'
import { useLogin } from './hooks'
import styles from './forms.module.css'

export function LoginPage() {
  usePageTitle('Entrar')
  const login = useLogin()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(issuesToFields(parsed.error.issues))
      return
    }
    setErrors({})
    login.mutate(parsed.data, { onSuccess: () => navigate(from, { replace: true }) })
  }

  return (
    <AuthShell
      title="Entrar"
      lead="Continue de onde parou."
      footer={
        <>
          Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField label="Usuário" name="username" autoComplete="username" autoCapitalize="none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username} />
        <TextField label="Senha" name="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <FormError>{login.error && errorMessage(login.error)}</FormError>
        <Button type="submit" loading={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
        <p className={styles.demo}>
          Quer só olhar? Use <b>nicole</b> e a senha <b>questlog123</b>.
        </p>
      </form>
    </AuthShell>
  )
}
