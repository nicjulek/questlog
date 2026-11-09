import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, signUp } from './helpers'

describe('auth', () => {
  it('cria conta, mantém a sessão e sai', async () => {
    const agent = await signUp()
    const me = await agent.get('/api/auth/me').expect(200)
    expect(me.body).toMatchObject({ username: 'nicole', displayName: 'Nicole' })
    expect(me.body).not.toHaveProperty('passwordHash')
    await agent.post('/api/auth/logout').expect(204)
    await agent.get('/api/auth/me').expect(401)
  })

  it('recusa usuário repetido e senha errada', async () => {
    await signUp()
    const dup = await request(app).post('/api/auth/register').send({ username: 'Nicole', displayName: 'Outra', password: 'outra-senha-1' }).expect(409)
    expect(dup.body.fields.username).toBeTruthy()
    await request(app).post('/api/auth/login').send({ username: 'nicole', password: 'errada' }).expect(401)
    await request(app).post('/api/auth/login').send({ username: 'NICOLE', password: 'senha-forte-123' }).expect(200)
  })

  it('valida os campos de cadastro', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'a b', displayName: '', password: '123' }).expect(400)
    expect(Object.keys(res.body.fields).sort()).toEqual(['displayName', 'password', 'username'])
  })

  it('protege as rotas privadas', async () => {
    await request(app).get('/api/games').expect(401)
  })
})
