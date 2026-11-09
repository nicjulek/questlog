import { existsSync } from 'node:fs'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './env'
import { readSession, requireAuth } from './middleware/auth'
import { errorHandler, notFoundHandler } from './middleware/errors'
import { achievementRoutes, gameAchievementRoutes } from './modules/achievements/achievements.routes'
import { authRoutes } from './modules/auth/auth.routes'
import { gameRoutes } from './modules/games/games.routes'
import { gameGuideRoutes, guideRoutes } from './modules/guides/guides.routes'
import { profileRoutes } from './modules/profiles/profiles.routes'
import { statsRoutes } from './modules/stats/stats.routes'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'https:']
        }
      }
    })
  )
  app.use(cors({ origin: env.WEB_ORIGIN.split(','), credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(readSession)

  const api = express.Router()
  api.get('/health', (_req, res) => res.json({ ok: true }))
  api.use('/auth', authRoutes)
  api.use('/u', profileRoutes)
  api.use('/games/:gameId/achievements', requireAuth, gameAchievementRoutes)
  api.use('/games/:gameId/guides', requireAuth, gameGuideRoutes)
  api.use('/games', requireAuth, gameRoutes)
  api.use('/achievements', requireAuth, achievementRoutes)
  api.use('/guides', requireAuth, guideRoutes)
  api.use('/stats', requireAuth, statsRoutes)

  app.use('/api', api)
  app.use('/api', notFoundHandler)

  const webDir = process.env.WEB_DIST ?? path.resolve(process.cwd(), '../web/dist')
  if (env.NODE_ENV === 'production' && existsSync(webDir)) {
    app.use(express.static(webDir, { index: false, maxAge: '7d' }))
    app.get('*', (_req, res) => res.sendFile(path.join(webDir, 'index.html')))
  }

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
