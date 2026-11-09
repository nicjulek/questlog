import { Router } from 'express'
import { route } from '../../lib/http'
import { currentUser } from '../../middleware/auth'
import { getStats } from './stats.service'

export const statsRoutes = Router()

statsRoutes.get('/', route(async (req, res) => res.json(await getStats(currentUser(req)))))
