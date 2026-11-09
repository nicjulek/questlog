import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { loginSchema, profileSchema, registerSchema } from '@questlog/shared'
import { body, route } from '../../lib/http'
import { clearSession, currentUser, requireAuth, setSession } from '../../middleware/auth'
import * as auth from './auth.service'

export const authRoutes = Router()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Muitas tentativas. Espere alguns minutos e tente de novo.' }
})

authRoutes.post('/register', limiter, route(async (req, res) => {
  const user = await auth.register(body(req, registerSchema))
  setSession(res, user.id)
  res.status(201).json(user)
}))

authRoutes.post('/login', limiter, route(async (req, res) => {
  const user = await auth.login(body(req, loginSchema))
  setSession(res, user.id)
  res.json(user)
}))

authRoutes.post('/logout', (_req, res) => {
  clearSession(res)
  res.status(204).end()
})

authRoutes.get('/me', requireAuth, route(async (req, res) => res.json(await auth.getUser(currentUser(req)))))

authRoutes.patch('/me', requireAuth, route(async (req, res) => res.json(await auth.updateProfile(currentUser(req), body(req, profileSchema)))))
