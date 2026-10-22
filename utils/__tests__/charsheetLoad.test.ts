import { isInitialCharsheetLoad } from '../charsheetLoad'

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
