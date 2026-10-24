import { DEFAULT_EXPERTISE_SORT, EXPERTISE_SORT_OPTIONS, filterAndSortExpertises, isExpertiseSort } from '../expertiseList'

type Entry = [ string, { value: number } ]
const entries: Entry[] = [
    [ 'Percepção', { value: 3 } ],
    [ 'Atletismo', { value: 5 } ],
    [ 'Furtividade', { value: 3 } ],
    [ 'Agilidade', { value: -1 } ],
    [ 'Ocultismo', { value: 0 } ]
]
const run = (options: { query?: string; sort?: Parameters<typeof filterAndSortExpertises>[1]['sort'] } = {}): string[] =>
    filterAndSortExpertises(entries, { ...options, nameOf: e => e[0], valueOf: e => e[1].value }).map(e => e[0])

describe('filterAndSortExpertises', () => {
    it('o padrão é a ordem alfabética', () => {
        expect(DEFAULT_EXPERTISE_SORT).toBe('alpha-asc')
        expect(run()).toEqual([ 'Agilidade', 'Atletismo', 'Furtividade', 'Ocultismo', 'Percepção' ])
    })

    it('Z → A inverte o alfabeto', () => {
        expect(run({ sort: 'alpha-desc' })).toEqual([ 'Percepção', 'Ocultismo', 'Furtividade', 'Atletismo', 'Agilidade' ])
    })

    it('valor decrescente e crescente, com o nome desempatando', () => {
        expect(run({ sort: 'value-desc' })).toEqual([ 'Atletismo', 'Furtividade', 'Percepção', 'Ocultismo', 'Agilidade' ])
        expect(run({ sort: 'value-asc' })).toEqual([ 'Agilidade', 'Ocultismo', 'Furtividade', 'Percepção', 'Atletismo' ])
    })

    it('ordena letras acentuadas junto das sem acento', () => {
        const list = filterAndSortExpertises([ 'Éter', 'Fogo', 'Arte', 'Água' ], { nameOf: n => n, valueOf: () => 0 })
        expect(list).toEqual([ 'Água', 'Arte', 'Éter', 'Fogo' ])
    })

    it('a busca ignora acento e caixa e combina com a ordem', () => {
        expect(run({ query: 'percepcao' })).toEqual([ 'Percepção' ])
        expect(run({ query: 'AT', sort: 'value-desc' })).toEqual([ 'Atletismo' ])
        expect(run({ query: 'a', sort: 'alpha-asc' })).toEqual([ 'Agilidade', 'Atletismo', 'Furtividade', 'Percepção' ])
        expect(run({ query: 'zzz' })).toEqual([])
    })

    it('não altera a lista recebida', () => {
        const before = entries.map(e => e[0])
        run({ sort: 'value-desc' })
        expect(entries.map(e => e[0])).toEqual(before)
    })

    it('valor inválido conta como zero', () => {
        const list = filterAndSortExpertises([ { n: 'a', v: Number.NaN }, { n: 'b', v: 2 } ], { sort: 'value-desc', nameOf: i => i.n, valueOf: i => i.v })
        expect(list.map(i => i.n)).toEqual([ 'b', 'a' ])
    })
})

describe('isExpertiseSort', () => {
    it('reconhece só as ordens da lista', () => {
        for (const option of EXPERTISE_SORT_OPTIONS) expect(isExpertiseSort(option.value)).toBe(true)
        expect(isExpertiseSort('value')).toBe(false)
        expect(isExpertiseSort(undefined)).toBe(false)
    })
})
