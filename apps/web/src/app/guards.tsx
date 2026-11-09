import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '../features/auth/hooks'
import { PageLoader } from './PageLoader'

export function RequireAuth() {
  const me = useMe()
  const location = useLocation()
  if (me.isPending) return <PageLoader />
  if (!me.data) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RequireGuest() {
  const me = useMe()
  if (me.isPending) return <PageLoader />
  if (me.data) return <Navigate to="/" replace />
  return <Outlet />
}
