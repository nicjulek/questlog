import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env'
import { unauthorized } from '../lib/errors'

export const SESSION_COOKIE = 'questlog_session'
const MAX_AGE_DAYS = 30

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number
  }
}

export function setSession(res: Response, userId: number) {
  const token = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: `${MAX_AGE_DAYS}d` })
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    path: '/'
  })
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}

export function readSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string }
      req.userId = Number(payload.sub)
    } catch {
      req.userId = undefined
    }
  }
  next()
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.userId) return next(unauthorized())
  next()
}

export const currentUser = (req: Request) => {
  if (!req.userId) throw unauthorized()
  return req.userId
}
