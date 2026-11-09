import { Router } from 'express'
import { achievementPatchSchema, achievementSchema, bulkAchievementsSchema } from '@questlog/shared'
import { body, idParam, route } from '../../lib/http'
import { currentUser } from '../../middleware/auth'
import * as service from './achievements.service'

export const gameAchievementRoutes = Router({ mergeParams: true })

gameAchievementRoutes.post('/', route(async (req, res) =>
  res.status(201).json(await service.addAchievement(currentUser(req), idParam(req, 'gameId'), body(req, achievementSchema)))
))

gameAchievementRoutes.post('/bulk', route(async (req, res) =>
  res.status(201).json(await service.addMany(currentUser(req), idParam(req, 'gameId'), body(req, bulkAchievementsSchema).text))
))

export const achievementRoutes = Router()

achievementRoutes.patch('/:id', route(async (req, res) =>
  res.json(await service.updateAchievement(currentUser(req), idParam(req), body(req, achievementPatchSchema)))
))

achievementRoutes.delete('/:id', route(async (req, res) => {
  await service.deleteAchievement(currentUser(req), idParam(req))
  res.status(204).end()
}))
