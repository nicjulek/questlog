import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { LoginInput, ProfileInput, RegisterInput, User } from '@questlog/shared'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { HttpError, conflict, notFound } from '../../lib/errors'

const publicUser = { id: users.id, username: users.username, displayName: users.displayName, bio: users.bio }

export async function register(input: RegisterInput): Promise<User> {
  const taken = await db.query.users.findFirst({ where: eq(users.username, input.username), columns: { id: true } })
  if (taken) throw conflict('Esse nome de usuário já está em uso.', { username: 'Esse nome de usuário já está em uso.' })
  const passwordHash = await bcrypt.hash(input.password, 10)
  const [user] = await db.insert(users).values({ username: input.username, displayName: input.displayName, passwordHash }).returning(publicUser)
  return user
}

export async function login(input: LoginInput): Promise<User> {
  const user = await db.query.users.findFirst({ where: eq(users.username, input.username) })
  const ok = user && (await bcrypt.compare(input.password, user.passwordHash))
  if (!user || !ok) throw new HttpError(401, 'Usuário ou senha incorretos.')
  return { id: user.id, username: user.username, displayName: user.displayName, bio: user.bio }
}

export async function getUser(id: number): Promise<User> {
  const [user] = await db.select(publicUser).from(users).where(eq(users.id, id))
  if (!user) throw notFound('Usuário')
  return user
}

export async function updateProfile(id: number, input: ProfileInput): Promise<User> {
  const [user] = await db.update(users).set({ ...input, updatedAt: new Date() }).where(eq(users.id, id)).returning(publicUser)
  return user
}
