import {
    collectFilterOptions,
    filterBySelections,
    getClientFilters,
    matchesSelection,
    toFilterValues
} from '../filterSelection'

describe('toFilterValues', () => {
    it('normaliza para lista', () => {
        expect(toFilterValues('a')).toEqual([ 'a' ])
        expect(toFilterValues([ 'a', 'b' ])).toEqual([ 'a', 'b' ])
        expect(toFilterValues(undefined)).toEqual([])
        expect(toFilterValues(null)).toEqual([])
        expect(toFilterValues([ 'a', '' ])).toEqual([ 'a' ])
    })
})

describe('matchesSelection', () => {
    it('sem seleção, tudo passa (até itens sem valor)', () => {
        expect(matchesSelection('a', [])).toBe(true)
        expect(matchesSelection(undefined, [])).toBe(true)
    })

    it('passa se algum valor do item estiver selecionado', () => {
        expect(matchesSelection('a', [ 'a', 'b' ])).toBe(true)
        expect(matchesSelection([ 'x', 'b' ], [ 'a', 'b' ])).toBe(true)
        expect(matchesSelection('c', [ 'a', 'b' ])).toBe(false)
    })

    it('item sem valor não passa quando há seleção', () => {
        expect(matchesSelection(undefined, [ 'a' ])).toBe(false)
        expect(matchesSelection([], [ 'a' ])).toBe(false)
    })
})

describe('filterBySelections', () => {
    const items = [
        { id: 1, tipo: 'x', sub: 'p' },
        { id: 2, tipo: 'x', sub: 'q' },
        { id: 3, tipo: 'y', sub: 'p' }
    ]
    const tipo = (i: typeof items[number]) => i.tipo
    const sub = (i: typeof items[number]) => i.sub

    it('devolve a própria lista quando nada está marcado', () => {
        expect(filterBySelections(items, [ { getValue: tipo, selected: [] }, { getValue: sub, selected: [] } ])).toBe(items)
    })

    it('ignora filtros sem getValue, mesmo com opções marcadas', () => {
        expect(filterBySelections(items, [ { selected: [ 'x' ] } ])).toBe(items)
    })

    it('combina os filtros por E', () => {
        const result = filterBySelections(items, [ { getValue: tipo, selected: [ 'x' ] }, { getValue: sub, selected: [ 'p' ] } ])
        expect(result.map(i => i.id)).toEqual([ 1 ])
    })

    it('um filtro sozinho funciona normalmente', () => {
        expect(filterBySelections(items, [ { getValue: tipo, selected: [] }, { getValue: sub, selected: [ 'p' ] } ]).map(i => i.id)).toEqual([ 1, 3 ])
    })
})

describe('collectFilterOptions', () => {
    const items = [ { v: [ 'b', 'z' ] }, { v: 'a' }, { v: undefined }, { v: [ 'b' ] } ]

    it('sem opções fixas, usa as encontradas em ordem alfabética', () => {
        expect(collectFilterOptions(items, i => i.v)).toEqual([ 'a', 'b', 'z' ])
    })

    it('opções fixas vêm primeiro, na ordem dada; as demais, depois', () => {
        expect(collectFilterOptions(items, i => i.v, [ 'z', 'k' ])).toEqual([ 'z', 'k', 'a', 'b' ])
    })

    it('não depende de os itens carregados cobrirem as opções fixas', () => {
        expect(collectFilterOptions([], () => undefined, [ 'z', 'k' ])).toEqual([ 'z', 'k' ])
    })
})

describe('getClientFilters', () => {
    const getValue = (item: { v: string }) => item.v

    it('cada menu vira o filtro principal e, se houver, o subfiltro, na ordem', () => {
        const filters = getClientFilters([
            { label: 'Tipo', getValue, options: [ 'a' ], subFilter: { label: 'Subtipo', getValue, options: [ 'b' ] } },
            { label: 'Execução', getValue }
        ])

        expect(filters.map(f => f.key)).toEqual([ 'Tipo', 'Tipo/Subtipo', 'Execução' ])
        expect(filters.map(f => f.label)).toEqual([ 'Tipo', 'Subtipo', 'Execução' ])
        expect(filters[1]?.options).toEqual([ 'b' ])
    })

    it('sem menus, lista vazia', () => {
        expect(getClientFilters()).toEqual([])
        expect(getClientFilters([])).toEqual([])
    })
})
