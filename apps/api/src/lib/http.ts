import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny, z } from 'zod'
import { HttpError } from './errors'

type Handler = (req: Request, res: Response) => Promise<unknown>

export const route = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next)
}

export const body = <S extends ZodTypeAny>(req: Request, schema: S): z.output<S> => schema.parse(req.body)

export function idParam(req: Request, name = 'id') {
  const id = Number(req.params[name])
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Registro não encontrado.')
  return id
}
