/**
 * Rotas de teste da campanha com a autenticação e o Firestore simulados:
 * confere permissões, o caminho de campo gravado e o uso da transação.
 */
const mockAuth = {
    requireUser: jest.fn(),
    requireCampaignGM: jest.fn(),
    requireCampaignMember: jest.fn()
}

jest.mock('@utils/api', () => ({
    ...jest.requireActual('@utils/api/errors'),
    ...jest.requireActual('@utils/api/input'),
    ...mockAuth
}))

const mockDocs = {
    adminUpdateDoc: jest.fn(),
    adminUpdateDocInTransaction: jest.fn()
}

jest.mock('@utils/firestore/adminDocs', () => mockDocs)

// eslint-disable-next-line import/first
import { POST as requestTest } from '../../../app/api/campaign/[id]/session/test-request/route'
// eslint-disable-next-line import/first
import { POST as respondTest } from '../../../app/api/campaign/[id]/session/test-response/route'

const params = { params: { id: 'camp-1' } }
const post = (body: unknown): Request => new Request('http://localhost/api/campaign/camp-1/session/x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
})

const campaign = { id: 'camp-1', status: 'active', admin: [ 'gm' ], players: [ { userId: 'ana', charsheetId: 'c1' }, { userId: 'bia', charsheetId: 'c2' } ] }

beforeEach(() => {
    jest.clearAllMocks()
})

describe('POST session/test-request (mestre)', () => {
    const body = { dt: 12, expertise: 'Furtividade', isGroupTest: true, isVisible: true, showResult: true, selectedPlayers: [ 'ana' ] }

    beforeEach(() => {
        mockAuth.requireUser.mockResolvedValue({ id: 'gm', name: 'Mestre' })
        mockAuth.requireCampaignGM.mockResolvedValue({ campaign, isGM: true })
    })

    it('grava só session.testRequest, com autor e id do servidor', async () => {
        const response = await requestTest(post(body), params)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(mockDocs.adminUpdateDoc).toHaveBeenCalledTimes(1)

        const [ collection, id, fields ] = mockDocs.adminUpdateDoc.mock.calls[0]
        expect(collection).toBe('campaigns')
        expect(id).toBe('camp-1')
        expect(Object.keys(fields)).toEqual([ 'session.testRequest' ])
        expect(fields['session.testRequest']).toMatchObject({ dt: 12, expertise: 'Furtividade', requestedBy: { id: 'gm', name: 'Mestre' }, selectedPlayers: [ 'ana' ] })
        expect(fields['session.testRequest'].id).toEqual(expect.any(String))
        expect(json.request).toEqual(fields['session.testRequest'])
    })

    it('cada pedido recebe um id novo', async () => {
        await requestTest(post(body), params)
        await requestTest(post(body), params)
        const ids = mockDocs.adminUpdateDoc.mock.calls.map(call => call[2]['session.testRequest'].id)
        expect(new Set(ids).size).toBe(2)
    })

    it('quem não é o mestre é recusado antes de qualquer escrita', async () => {
        const { forbidden } = jest.requireActual('@utils/api/errors')
        mockAuth.requireCampaignGM.mockRejectedValue(forbidden('Apenas o mestre da campanha pode fazer isso'))

        const response = await requestTest(post(body), params)
        expect(response.status).toBe(403)
        expect(mockDocs.adminUpdateDoc).not.toHaveBeenCalled()
    })

    it('campanha finalizada não aceita testes', async () => {
        mockAuth.requireCampaignGM.mockResolvedValue({ campaign: { ...campaign, status: 'finished' }, isGM: true })
        const response = await requestTest(post(body), params)
        expect(response.status).toBe(403)
        expect(mockDocs.adminUpdateDoc).not.toHaveBeenCalled()
    })

    it('corpo inválido volta 400 e não grava', async () => {
        const response = await requestTest(post({ ...body, dt: 500 }), params)
        expect(response.status).toBe(400)
        expect(mockDocs.adminUpdateDoc).not.toHaveBeenCalled()
    })
})

describe('POST session/test-response (jogador)', () => {
    const request = {
        id: 'teste-1',
        dt: 15,
        isGroupTest: true,
        isVisible: true,
        showResult: true,
        selectedPlayers: [],
        requestedBy: { id: 'gm', name: 'Mestre' },
        createdAt: new Date().toISOString()
    }

    /** Executa a função da transação com o documento simulado e devolve o resultado, como o Firestore faria */
    const runTransaction = (doc: unknown) => {
        mockDocs.adminUpdateDocInTransaction.mockImplementation(async (_name: string, _id: string, run: (data: unknown) => { result: unknown }) => run(doc).result)
    }

    beforeEach(() => {
        mockAuth.requireUser.mockResolvedValue({ id: 'ana', name: 'Ana' })
        mockAuth.requireCampaignMember.mockResolvedValue({ campaign, isGM: false })
        runTransaction({ session: { testRequest: request } })
    })

    it('grava a resposta em session.testRequest.responses.<userId> numa transação', async () => {
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10, 14 ], bonus: 3 }), params)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json.response).toMatchObject({ userName: 'Ana', rolls: [ 10, 14 ], usedRoll: 14, total: 17, success: true })

        expect(mockDocs.adminUpdateDocInTransaction).toHaveBeenCalledTimes(1)
        const [ collection, id, run ] = mockDocs.adminUpdateDocInTransaction.mock.calls[0]
        expect(collection).toBe('campaigns')
        expect(id).toBe('camp-1')

        const { fields } = run({ session: { testRequest: request } })
        expect(Object.keys(fields)).toEqual([ 'session.testRequest.responses.ana' ])
        expect(fields['session.testRequest.responses.ana']).toMatchObject({ total: 17, success: true })
    })

    it('o veredito vem do servidor, não do navegador', async () => {
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 2 ], bonus: 3, success: true, total: 99 }), params)
        const json = await response.json()
        expect(json.response).toMatchObject({ total: 5, success: false })
    })

    it('o mestre não responde', async () => {
        mockAuth.requireCampaignMember.mockResolvedValue({ campaign, isGM: true })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(403)
        expect(mockDocs.adminUpdateDocInTransaction).not.toHaveBeenCalled()
    })

    it('quem não é da campanha é recusado', async () => {
        const { forbidden } = jest.requireActual('@utils/api/errors')
        mockAuth.requireCampaignMember.mockRejectedValue(forbidden('Você não participa desta campanha'))
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(403)
    })

    it('teste substituído no meio do caminho vira 409 e nada é gravado', async () => {
        runTransaction({ session: { testRequest: { ...request, id: 'teste-2' } } })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(409)
    })

    it('sem teste em andamento é 409', async () => {
        runTransaction({ session: {} })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(409)
    })

    it('já respondeu: 409', async () => {
        runTransaction({ session: { testRequest: { ...request, responses: { ana: { total: 10 } } } } })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(409)
    })

    it('campanha finalizada não aceita respostas', async () => {
        mockAuth.requireCampaignMember.mockResolvedValue({ campaign: { ...campaign, status: 'finished' }, isGM: false })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(403)
        expect(mockDocs.adminUpdateDocInTransaction).not.toHaveBeenCalled()
    })

    it('ID de usuário com ponto não vira caminho de campo', async () => {
        mockAuth.requireUser.mockResolvedValue({ id: 'a.b', name: 'Ana' })
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 10 ], bonus: 0 }), params)
        expect(response.status).toBe(403)
        expect(mockDocs.adminUpdateDocInTransaction).not.toHaveBeenCalled()
    })

    it('rolagem inválida volta 400', async () => {
        const response = await respondTest(post({ requestId: 'teste-1', rolls: [ 25 ], bonus: 0 }), params)
        expect(response.status).toBe(400)
    })
})
