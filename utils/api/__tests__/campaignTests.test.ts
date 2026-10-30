import type { ActiveTest } from '../../../models/types/session'
import { ApiError } from '../errors'
import { buildTestRequest, buildTestResponse } from '../campaignTests'

const NOW = new Date('2026-10-21T20:00:00.000Z')
const campaign = { players: [ { userId: 'ana' }, { userId: 'bia' } ] }
const requestedBy = { id: 'gm', name: 'Mestre' }

const validBody = {
    dt: 12,
    expertise: 'Furtividade',
    isGroupTest: false,
    isVisible: true,
    showResult: true,
    selectedPlayers: [ 'ana' ]
}

const build = (body: unknown) => buildTestRequest(body, { campaign, requestedBy, id: 'teste-1', now: NOW })

const statusOf = (fn: () => unknown): number => {
    try {
        fn()
    } catch (error) {
        if (error instanceof ApiError) return error.status
        throw error
    }
    return 200
}

describe('buildTestRequest', () => {
    it('monta o teste com id, autor e horário do servidor', () => {
        expect(build(validBody)).toEqual({
            id: 'teste-1',
            dt: 12,
            expertise: 'Furtividade',
            isGroupTest: false,
            isVisible: true,
            showResult: true,
            selectedPlayers: [ 'ana' ],
            requestedBy,
            createdAt: '2026-10-21T20:00:00.000Z'
        })
    })

    it('sem perícia, a chave nem existe (o Firestore não aceita undefined)', () => {
        expect('expertise' in build({ ...validBody, expertise: undefined })).toBe(false)
        expect('expertise' in build({ ...validBody, expertise: '  ' })).toBe(false)
    })

    it('teste geral aceita lista vazia; individual exige ao menos um jogador', () => {
        expect(build({ ...validBody, isGroupTest: true, selectedPlayers: [] }).selectedPlayers).toEqual([])
        expect(statusOf(() => build({ ...validBody, selectedPlayers: [] }))).toBe(400)
    })

    it('tira jogadores repetidos', () => {
        expect(build({ ...validBody, selectedPlayers: [ 'ana', 'ana', 'bia' ] }).selectedPlayers).toEqual([ 'ana', 'bia' ])
    })

    it('só chama jogadores da campanha', () => {
        expect(statusOf(() => build({ ...validBody, selectedPlayers: [ 'intruso' ] }))).toBe(403)
        expect(statusOf(() => build({ ...validBody, selectedPlayers: [ '../x' ] }))).toBe(403)
    })

    it.each([ 0, 100, 1.5, '12', null, undefined ])('DT %p é recusada', (dt) => {
        expect(statusOf(() => build({ ...validBody, dt }))).toBe(400)
    })

    it('limites da DT valem', () => {
        expect(build({ ...validBody, dt: 1 }).dt).toBe(1)
        expect(build({ ...validBody, dt: 99 }).dt).toBe(99)
    })

    it('opções precisam ser verdadeiro ou falso', () => {
        expect(statusOf(() => build({ ...validBody, isVisible: 'sim' }))).toBe(400)
        expect(statusOf(() => build({ ...validBody, showResult: undefined }))).toBe(400)
        expect(statusOf(() => build({ ...validBody, isGroupTest: 1 }))).toBe(400)
    })

    it('recusa perícia que não é texto ou é longa demais', () => {
        expect(statusOf(() => build({ ...validBody, expertise: 5 }))).toBe(400)
        expect(statusOf(() => build({ ...validBody, expertise: 'x'.repeat(500) }))).toBe(400)
    })

    it.each([ null, 'texto', 3, [] ])('corpo %p é recusado', (body) => {
        expect(statusOf(() => build(body))).toBe(400)
    })
})

describe('buildTestResponse', () => {
    const request: ActiveTest = {
        id: 'teste-1',
        dt: 15,
        expertise: 'Furtividade',
        isGroupTest: false,
        isVisible: true,
        showResult: true,
        selectedPlayers: [ 'ana' ],
        requestedBy,
        createdAt: '2026-10-21T19:58:00.000Z'
    }
    const ana = { id: 'ana', name: 'Ana' }
    const respond = (body: unknown, overrides: { request?: ActiveTest | undefined, user?: typeof ana } = {}) =>
        buildTestResponse(body, {
            request: 'request' in overrides ? overrides.request : request,
            user: overrides.user ?? ana,
            now: NOW
        })

    it('o servidor refaz a conta: maior d20 + bônus contra a DT', () => {
        expect(respond({ requestId: 'teste-1', rolls: [ 7, 12, 3 ], bonus: 3 })).toEqual({
            userName: 'Ana',
            rolls: [ 7, 12, 3 ],
            dice: 3,
            bonus: 3,
            usedRoll: 12,
            total: 15,
            success: true,
            respondedAt: '2026-10-21T20:00:00.000Z'
        })
        expect(respond({ requestId: 'teste-1', rolls: [ 7, 12, 3 ], bonus: 2 }).success).toBe(false)
    })

    it('modificador negativo (regra única de d20): com keep lowest vale o menor d20, e a resposta guarda isso', () => {
        const response = respond({ requestId: 'teste-1', rolls: [ 12, 7 ], bonus: 3, keep: 'lowest' })
        expect(response).toMatchObject({ rolls: [ 12, 7 ], dice: 2, usedRoll: 7, total: 10, success: false, keep: 'lowest' })
        // sem keep (ou com qualquer outro valor) vale o maior, e a resposta não leva o campo
        const normal = respond({ requestId: 'teste-1', rolls: [ 12, 7 ], bonus: 3, keep: 'highest' })
        expect(normal).toMatchObject({ usedRoll: 12, total: 15, success: true })
        expect(normal.keep).toBeUndefined()
        expect(respond({ requestId: 'teste-1', rolls: [ 12, 7 ], bonus: 3, keep: 'lixo' }).usedRoll).toBe(12)
    })

    it('ignora total, veredito e dado usado vindos do navegador', () => {
        const response = respond({ requestId: 'teste-1', rolls: [ 2 ], bonus: 0, total: 99, success: true, usedRoll: 20 })
        expect(response.total).toBe(2)
        expect(response.usedRoll).toBe(2)
        expect(response.success).toBe(false)
    })

    it('sem teste em andamento ou com outro pedido (substituído), é conflito', () => {
        expect(statusOf(() => respond({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }, { request: undefined }))).toBe(409)
        expect(statusOf(() => respond({ requestId: 'teste-0', rolls: [ 10 ], bonus: 0 }))).toBe(409)
    })

    it('teste vencido é conflito', () => {
        const velho = { ...request, createdAt: '2026-10-21T19:00:00.000Z' }
        expect(statusOf(() => respond({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }, { request: velho }))).toBe(409)
    })

    it('quem não foi chamado é recusado; num teste geral qualquer jogador responde', () => {
        const bia = { id: 'bia', name: 'Bia' }
        expect(statusOf(() => respond({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }, { user: bia }))).toBe(403)
        const geral = { ...request, isGroupTest: true, selectedPlayers: [] }
        expect(respond({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }, { request: geral, user: bia }).userName).toBe('Bia')
    })

    it('não responde duas vezes ao mesmo teste', () => {
        const respondido = { ...request, responses: { ana: respond({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }) } }
        expect(statusOf(() => respond({ requestId: 'teste-1', rolls: [ 20 ], bonus: 0 }, { request: respondido }))).toBe(409)
    })

    it.each([
        [ 'sem dados', { requestId: 'teste-1', rolls: [], bonus: 0 } ],
        [ 'dados demais', { requestId: 'teste-1', rolls: Array(21).fill(10), bonus: 0 } ],
        [ 'd20 fora da faixa', { requestId: 'teste-1', rolls: [ 21 ], bonus: 0 } ],
        [ 'd20 zero', { requestId: 'teste-1', rolls: [ 0 ], bonus: 0 } ],
        [ 'd20 decimal', { requestId: 'teste-1', rolls: [ 10.5 ], bonus: 0 } ],
        [ 'dados não é lista', { requestId: 'teste-1', rolls: 10, bonus: 0 } ],
        [ 'bônus absurdo', { requestId: 'teste-1', rolls: [ 10 ], bonus: 1000 } ],
        [ 'bônus decimal', { requestId: 'teste-1', rolls: [ 10 ], bonus: 1.5 } ],
        [ 'bônus ausente', { requestId: 'teste-1', rolls: [ 10 ] } ]
    ])('recusa rolagem inválida: %s', (_name, body) => {
        expect(statusOf(() => respond(body))).toBe(400)
    })

    it('corpo que não é objeto é recusado', () => {
        expect(statusOf(() => respond(null))).toBe(400)
    })
})
