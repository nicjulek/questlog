import { Router } from 'express'
import { z } from 'zod'
import { GAME_STATUSES, gamePatchSchema, gameSchema } from '@questlog/shared'
import { body, idParam, route } from '../../lib/http'
import { currentUser } from '../../middleware/auth'
import * as games from './games.service'

export const gameRoutes = Router()

const listQuery = z.object({ status: z.enum(GAME_STATUSES).optional(), q: z.string().trim().max(100).optional() })

gameRoutes.get('/', route(async (req, res) => res.json(await games.listGames(currentUser(req), listQuery.parse(req.query)))))
gameRoutes.post('/', route(async (req, res) => res.status(201).json(await games.createGame(currentUser(req), body(req, gameSchema)))))
gameRoutes.get('/:id', route(async (req, res) => res.json(await games.getGame(currentUser(req), idParam(req)))))
gameRoutes.patch('/:id', route(async (req, res) => res.json(await games.updateGame(currentUser(req), idParam(req), body(req, gamePatchSchema)))))
gameRoutes.delete('/:id', route(async (req, res) => {
  await games.deleteGame(currentUser(req), idParam(req))
  res.status(204).end()
}))
