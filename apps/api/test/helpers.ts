import request from 'supertest'
import { createApp } from '../src/app'

export const app = createApp()

export async function signUp(username = 'nicole') {
  const agent = request.agent(app)
  await agent.post('/api/auth/register').send({ username, displayName: 'Nicole', password: 'senha-forte-123' }).expect(201)
  return agent
}
