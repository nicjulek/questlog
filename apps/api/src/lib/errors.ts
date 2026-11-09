export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message)
  }
}

export const notFound = (what = 'Registro') => new HttpError(404, `${what} não encontrado.`)
export const unauthorized = () => new HttpError(401, 'Entre na sua conta para continuar.')
export const conflict = (message: string, fields?: Record<string, string>) => new HttpError(409, message, fields)
