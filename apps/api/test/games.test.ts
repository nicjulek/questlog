import { describe, expect, it } from 'vitest'
import { signUp } from './helpers'

describe('jogos e conquistas', () => {
  it('cria um jogo, adiciona conquistas em lote e desbloqueia', async () => {
    const agent = await signUp()
    const game = await agent.post('/api/games').send({ title: 'Outer Wilds', status: 'playing', hours: 22.5 }).expect(201)
    expect(game.body).toMatchObject({ title: 'Outer Wilds', platform: 'PC', achievementsTotal: 0 })

    const bulk = await agent
      .post(`/api/games/${game.body.id}/achievements/bulk`)
      .send({ text: 'Levado em 60 segundos - Morra em 60 segundos após acordar\n\n* Convergência - Pegue todos os instrumentos\nBem apertado' })
      .expect(201)
    expect(bulk.body).toHaveLength(3)
    expect(bulk.body[1]).toMatchObject({ title: 'Convergência', secret: true, position: 1 })
    expect(bulk.body[2].description).toBeNull()

    const now = new Date().toISOString()
    await agent.patch(`/api/achievements/${bulk.body[0].id}`).send({ unlockedAt: now }).expect(200)

    const detail = await agent.get(`/api/games/${game.body.id}`).expect(200)
    expect(detail.body).toMatchObject({ achievementsTotal: 3, achievementsUnlocked: 1, hours: 22.5 })
    expect(detail.body.achievements.map((a: { title: string }) => a.title)).toEqual(['Levado em 60 segundos', 'Convergência', 'Bem apertado'])

    await agent.patch(`/api/achievements/${bulk.body[0].id}`).send({ unlockedAt: null }).expect(200)
    expect((await agent.get(`/api/games/${game.body.id}`)).body.achievementsUnlocked).toBe(0)
  })

  it('filtra a biblioteca por status e busca', async () => {
    const agent = await signUp()
    await agent.post('/api/games').send({ title: 'Gris', status: 'platinum' })
    await agent.post('/api/games').send({ title: 'Hollow Knight', status: 'beaten' })
    expect((await agent.get('/api/games?status=platinum')).body).toHaveLength(1)
    expect((await agent.get('/api/games?q=hollow')).body[0].title).toBe('Hollow Knight')
  })

  it('não deixa uma pessoa ver ou mexer no jogo de outra', async () => {
    const ana = await signUp('ana')
    const game = await ana.post('/api/games').send({ title: 'Celeste' })
    const [a] = (await ana.post(`/api/games/${game.body.id}/achievements/bulk`).send({ text: 'Morango' })).body
    const bia = await signUp('bia')
    await bia.get(`/api/games/${game.body.id}`).expect(404)
    await bia.patch(`/api/achievements/${a.id}`).send({ unlockedAt: new Date().toISOString() }).expect(404)
    await bia.post(`/api/games/${game.body.id}/achievements`).send({ title: 'Invasão' }).expect(404)
    await bia.delete(`/api/games/${game.body.id}`).expect(404)
  })

  it('valida o jogo', async () => {
    const agent = await signUp()
    const res = await agent.post('/api/games').send({ title: '', hours: -1, coverUrl: 'imagem' }).expect(400)
    expect(Object.keys(res.body.fields).sort()).toEqual(['coverUrl', 'hours', 'title'])
  })
})
