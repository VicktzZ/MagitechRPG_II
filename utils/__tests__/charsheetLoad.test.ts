import { isFetchByIdsPending, isInitialCharsheetLoad } from '../charsheetLoad'

describe('isInitialCharsheetLoad', () => {
    it('primeira carga: carregando e nenhuma ficha carregada ainda', () => {
        expect(isInitialCharsheetLoad(true, undefined, 'c1')).toBe(true)
    })

    it('já carregou esta ficha: recarregar magias e poderes não volta ao spinner', () => {
        expect(isInitialCharsheetLoad(true, 'c1', 'c1')).toBe(false)
    })

    it('trocar para outra ficha volta a ser carga inicial', () => {
        expect(isInitialCharsheetLoad(true, 'c1', 'c2')).toBe(true)
    })

    it('terminou de carregar: nunca é carga inicial', () => {
        expect(isInitialCharsheetLoad(false, undefined, 'c1')).toBe(false)
        expect(isInitialCharsheetLoad(false, 'c1', 'c1')).toBe(false)
    })
})

describe('isFetchByIdsPending', () => {
    it('os ids acabaram de aparecer e nada foi entregue: pendente já neste render', () => {
        expect(isFetchByIdsPending(true, 'a|b', null, false)).toBe(true)
    })

    it('entregou exatamente estes ids: terminou', () => {
        expect(isFetchByIdsPending(true, 'a|b', 'a|b', false)).toBe(false)
    })

    it('a lista de ids mudou depois de entregar: pendente de novo até entregar a nova', () => {
        expect(isFetchByIdsPending(true, 'a|b|c', 'a|b', false)).toBe(true)
    })

    it('sem ids ou desligado: nada a esperar', () => {
        expect(isFetchByIdsPending(true, '', null, false)).toBe(false)
        expect(isFetchByIdsPending(false, 'a', null, false)).toBe(false)
    })

    it('erro na busca não prende a tela em carregamento para sempre', () => {
        expect(isFetchByIdsPending(true, 'a', null, true)).toBe(false)
    })
})
