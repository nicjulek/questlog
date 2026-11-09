import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, signUp } from './helpers'

const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Destrua as estátuas.' }] }] }

describe('guias, estatísticas e perfil público', () => {
  it('só mostra guias publicados no perfil público', async () => {
    const agent = await signUp()
    const game = (await agent.post('/api/games').send({ title: 'Gris', status: 'platinum' })).body
    const guide = (await agent.post(`/api/games/${game.id}/guides`).send({ title: 'Inuksuit: as 14 estátuas', content: doc }).expect(201)).body
    expect(guide).toMatchObject({ slug: 'inuksuit-as-14-estatuas', published: false, gameTitle: 'Gris' })

    await request(app).get('/api/u/nicole/guides/inuksuit-as-14-estatuas').expect(404)
    await agent.patch(`/api/guides/${guide.id}`).send({ published: true }).expect(200)
    const pub = await request(app).get('/api/u/nicole/guides/inuksuit-as-14-estatuas').expect(200)
    expect(pub.body.author.displayName).toBe('Nicole')
    expect(pub.body.content).toEqual(doc)

    const second = (await agent.post(`/api/games/${game.id}/guides`).send({ title: 'Inuksuit: as 14 estátuas', content: doc })).body
    expect(second.slug).toBe('inuksuit-as-14-estatuas-2')

    const profile = await request(app).get('/api/u/nicole').expect(200)
    expect(profile.body.guides).toHaveLength(1)
    expect(profile.body.user).not.toHaveProperty('id')
  })

  it('calcula as estatísticas', async () => {
    const agent = await signUp()
    const g1 = (await agent.post('/api/games').send({ title: 'Gris', status: 'platinum', hours: 5 })).body
    const g2 = (await agent.post('/api/games').send({ title: 'Outer Wilds', status: 'playing', hours: 20 })).body
    const a1 = (await agent.post(`/api/games/${g1.id}/achievements/bulk`).send({ text: 'Vermelho\nVerde' })).body
    const a2 = (await agent.post(`/api/games/${g2.id}/achievements/bulk`).send({ text: 'A\nB\nC\nD' })).body
    const now = new Date().toISOString()
    for (const a of [...a1, a2[0], a2[1], a2[2]]) await agent.patch(`/api/achievements/${a.id}`).send({ unlockedAt: now })

    const { body } = await agent.get('/api/stats').expect(200)
    expect(body).toMatchObject({ games: 2, hours: 25, achievementsTotal: 6, achievementsUnlocked: 5, perfectGames: 1 })
    expect(body.byStatus).toMatchObject({ platinum: 1, playing: 1, backlog: 0 })
    expect(body.closest[0]).toMatchObject({ title: 'Outer Wilds', unlocked: 3, total: 4 })
    expect(body.unlocksByDay.at(-1).total).toBe(5)
    expect(body.recent).toHaveLength(5)
  })
})
