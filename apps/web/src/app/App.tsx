import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { queryClient } from '../lib/queryClient'
import { Toaster } from '../components/ui/Toaster'
import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { RequireAuth, RequireGuest } from './guards'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { LibraryPage } from '../features/library/LibraryPage'
import { GamePage } from '../features/game/GamePage'
import { NotFoundPage } from './NotFoundPage'
import { PageLoader } from './PageLoader'

const GuidesPage = lazy(() => import('../features/guides/GuidesPage'))
const GuideEditorPage = lazy(() => import('../features/guides/GuideEditorPage'))
const PublicGuidePage = lazy(() => import('../features/guides/PublicGuidePage'))
const StatsPage = lazy(() => import('../features/stats/StatsPage'))
const SettingsPage = lazy(() => import('../features/profile/SettingsPage'))
const PublicProfilePage = lazy(() => import('../features/profile/PublicProfilePage'))

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path="/entrar" element={<LoginPage />} />
              <Route path="/criar-conta" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<LibraryPage />} />
                <Route path="jogos/:gameId" element={<GamePage />} />
                <Route path="jogos/:gameId/guias/novo" element={<GuideEditorPage />} />
                <Route path="guias" element={<GuidesPage />} />
                <Route path="guias/:guideId/editar" element={<GuideEditorPage />} />
                <Route path="estatisticas" element={<StatsPage />} />
                <Route path="conta" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route element={<PublicLayout />}>
              <Route path="u/:username" element={<PublicProfilePage />} />
              <Route path="u/:username/guias/:slug" element={<PublicGuidePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
