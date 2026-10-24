import { matchesSearch, normalizeSearchText } from '../searchText'

describe('normalizeSearchText', () => {
    it('tira acento, caixa e espaços das pontas', () => {
        expect(normalizeSearchText('  Atlétismo ')).toBe('atletismo')
        expect(normalizeSearchText('EXPLOSÃO')).toBe('explosao')
    })

    it('valores vazios viram texto vazio', () => {
        expect(normalizeSearchText(null)).toBe('')
        expect(normalizeSearchText(undefined)).toBe('')
        expect(normalizeSearchText(12)).toBe('12')
    })
})

describe('matchesSearch', () => {
    it('busca vazia acha tudo', () => {
        expect(matchesSearch('Furtividade', '')).toBe(true)
        expect(matchesSearch('Furtividade', '   ')).toBe(true)
    })

    it('ignora acento e caixa', () => {
        expect(matchesSearch('Atletismo', 'ATLÉT')).toBe(true)
        expect(matchesSearch('Percepção', 'percepcao')).toBe(true)
    })

    it('cada palavra precisa aparecer, em qualquer ordem', () => {
        expect(matchesSearch('Arco de Luz fogo', 'luz arco')).toBe(true)
        expect(matchesSearch('Arco de Luz', 'luz espada')).toBe(false)
    })
})
