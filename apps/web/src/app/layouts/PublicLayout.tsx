import { Link, Outlet } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks'
import { Brand } from './Brand'
import styles from './PublicLayout.module.css'

export function PublicLayout() {
  const { data: me } = useMe()
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Brand to={me ? '/' : '/entrar'} />
        {me ? (
          <Link to="/" className={styles.link}>
            Minha biblioteca
          </Link>
        ) : (
          <Link to="/criar-conta" className={styles.link}>
            Criar conta
          </Link>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
