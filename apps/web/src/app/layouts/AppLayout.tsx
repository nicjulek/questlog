import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../../components/ui/Icon'
import { useLogout, useMe } from '../../features/auth/hooks'
import { toast } from '../../stores/toast'
import { Brand } from './Brand'
import styles from './AppLayout.module.css'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Biblioteca', icon: 'library', end: true },
  { to: '/guias', label: 'Guias', icon: 'guide' },
  { to: '/estatisticas', label: 'Estatísticas', icon: 'stats' },
  { to: '/conta', label: 'Conta', icon: 'user' }
]

export function AppLayout() {
  const { data: me } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()

  const signOut = () =>
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/entrar')
        toast('Você saiu da conta')
      }
    })

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skip}>
        Pular para o conteúdo
      </a>
      <aside className={styles.sidebar}>
        <Brand />
        <nav aria-label="Principal" className={styles.nav}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        {me && (
          <div className={styles.me}>
            <NavLink to={`/u/${me.username}`} className={styles.profileLink}>
              <span className={styles.avatar} aria-hidden="true">
                {me.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.who}>
                <strong>{me.displayName}</strong>
                <small>Ver perfil público</small>
              </span>
            </NavLink>
            <button type="button" className={styles.logout} onClick={signOut} aria-label="Sair da conta" title="Sair da conta">
              <Icon name="logout" size={18} />
            </button>
          </div>
        )}
      </aside>
      <main id="conteudo" className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
