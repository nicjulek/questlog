import { Router } from 'express'
import { route } from '../../lib/http'
import { getPublicGuide } from '../guides/guides.service'
import { getPublicProfile } from './profiles.service'

export const profileRoutes = Router()

profileRoutes.get('/:username', route(async (req, res) => res.json(await getPublicProfile(req.params.username))))
profileRoutes.get('/:username/guides/:slug', route(async (req, res) => res.json(await getPublicGuide(req.params.username, req.params.slug))))
