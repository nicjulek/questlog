import { Router } from 'express'
import { guidePatchSchema, guideSchema } from '@questlog/shared'
import { body, idParam, route } from '../../lib/http'
import { currentUser } from '../../middleware/auth'
import * as service from './guides.service'

export const gameGuideRoutes = Router({ mergeParams: true })

gameGuideRoutes.get('/', route(async (req, res) => res.json(await service.listGuides(currentUser(req), idParam(req, 'gameId')))))
gameGuideRoutes.post('/', route(async (req, res) =>
  res.status(201).json(await service.createGuide(currentUser(req), idParam(req, 'gameId'), body(req, guideSchema)))
))

export const guideRoutes = Router()

guideRoutes.get('/', route(async (req, res) => res.json(await service.listGuides(currentUser(req)))))
guideRoutes.get('/:id', route(async (req, res) => res.json(await service.getGuide(currentUser(req), idParam(req)))))
guideRoutes.patch('/:id', route(async (req, res) => res.json(await service.updateGuide(currentUser(req), idParam(req), body(req, guidePatchSchema)))))
guideRoutes.delete('/:id', route(async (req, res) => {
  await service.deleteGuide(currentUser(req), idParam(req))
  res.status(204).end()
}))
