import { CampaignLookupError, resolveCampaignLoadStatus, type CampaignLoadInput } from '../campaignLoadStatus'

const input = (overrides: { [K in keyof CampaignLoadInput]?: Partial<CampaignLoadInput[K]> } = {}): CampaignLoadInput => ({
    lookup: { pending: false, error: null, ...overrides.lookup },
    realtime: { settled: true, error: null, found: true, ...overrides.realtime }
})

describe('resolveCampaignLoadStatus', () => {
    it('carregando enquanto o código ainda não virou ID', () => {
        expect(resolveCampaignLoadStatus(input({ lookup: { pending: true }, realtime: { settled: false, found: false } }))).toBe('loading')
    })

    it('carregando enquanto o listener da campanha não respondeu', () => {
        expect(resolveCampaignLoadStatus(input({ realtime: { settled: false, found: false } }))).toBe('loading')
    })

    it('pronta quando o documento existe', () => {
        expect(resolveCampaignLoadStatus(input())).toBe('ready')
    })

    it('código inexistente (404 da API) é "não encontrada", não carregamento infinito', () => {
        const error = new CampaignLookupError('Falha ao buscar a campanha (404)', 404)
        expect(resolveCampaignLoadStatus(input({ lookup: { error }, realtime: { settled: false, found: false } }))).toBe('not-found')
    })

    it.each([ 401, 403, 500, 0 ])('falha da API (%i) é erro, não "não encontrada"', (status) => {
        const error = new CampaignLookupError(`Falha (${status})`, status)
        expect(resolveCampaignLoadStatus(input({ lookup: { error }, realtime: { settled: false, found: false } }))).toBe('error')
    })

    it('erro que não é da busca do código (ex.: rede) também é erro', () => {
        expect(resolveCampaignLoadStatus(input({ lookup: { error: new TypeError('Failed to fetch') }, realtime: { found: false } }))).toBe('error')
    })

    it('campanha excluída: o listener responde sem documento', () => {
        expect(resolveCampaignLoadStatus(input({ realtime: { settled: true, found: false } }))).toBe('not-found')
    })

    it('sem permissão no listener é erro', () => {
        expect(resolveCampaignLoadStatus(input({ realtime: { settled: true, found: false, error: new Error('permission-denied') } }))).toBe('error')
    })

    it('campanha já carregada continua pronta se o listener falhar depois', () => {
        expect(resolveCampaignLoadStatus(input({ realtime: { found: true, error: new Error('unavailable') } }))).toBe('ready')
    })

    it('não declara "não encontrada" antes do listener responder para o ID atual', () => {
        expect(resolveCampaignLoadStatus(input({ realtime: { settled: false, found: false } }))).toBe('loading')
    })
})
