import { filterSpells, summarizeSpells } from '../spellsOverview'

const spells = [
    { name: 'Brasa Voraz', element: 'FOGO', level: 2, mpCost: 4, type: 'Ataque (imediato)' },
    { name: 'Maré Alta', element: 'ÁGUA', level: 3, mpCost: 7, type: 'Controle (contínuo)' },
    { name: 'Hemorragia', element: 'SANGUE', level: 4, mpCost: 12, type: 'Ataque (conjurado)' },
    { name: 'Fagulha', element: 'FOGO', level: 1, mpCost: 2, type: 'Ataque (imediato)' }
]

describe('filterSpells', () => {
    it('sem filtro devolve todas na mesma ordem', () => {
        expect(filterSpells(spells, {}).map(s => s.name)).toEqual([ 'Brasa Voraz', 'Maré Alta', 'Hemorragia', 'Fagulha' ])
    })

    it('busca por nome sem acento nem caixa', () => {
        expect(filterSpells(spells, { query: 'mare' }).map(s => s.name)).toEqual([ 'Maré Alta' ])
        expect(filterSpells(spells, { query: 'ataque' }).map(s => s.name)).toEqual([ 'Brasa Voraz', 'Hemorragia', 'Fagulha' ])
    })

    it('filtra por elemento (qualquer caixa) e por nível, e combina', () => {
        expect(filterSpells(spells, { element: 'fogo' }).map(s => s.name)).toEqual([ 'Brasa Voraz', 'Fagulha' ])
        expect(filterSpells(spells, { element: 'agua' }).map(s => s.name)).toEqual([ 'Maré Alta' ])
        expect(filterSpells(spells, { level: 2 }).map(s => s.name)).toEqual([ 'Brasa Voraz' ])
        expect(filterSpells(spells, { level: '1', element: 'FOGO' }).map(s => s.name)).toEqual([ 'Fagulha' ])
        expect(filterSpells(spells, { level: 0 })).toHaveLength(4)
    })
})

describe('summarizeSpells', () => {
    it('conta por nível, tira a média do custo base e agrupa os elementos', () => {
        const overview = summarizeSpells(spells)
        expect(overview.total).toBe(4)
        expect(overview.byLevel).toEqual({ 1: 1, 2: 1, 3: 1, 4: 1 })
        expect(overview.averageMpCost).toBe(6)
        expect(overview.elements).toEqual([
            { element: 'FOGO', count: 2, secondary: false },
            { element: 'ÁGUA', count: 1, secondary: false },
            { element: 'SANGUE', count: 1, secondary: true }
        ])
    })

    it('sem magias não inventa média', () => {
        expect(summarizeSpells([])).toEqual({ total: 0, byLevel: { 1: 0, 2: 0, 3: 0, 4: 0 }, averageMpCost: null, elements: [] })
    })

    it('ignora nível e custo inválidos sem quebrar', () => {
        const overview = summarizeSpells([ { name: 'x', element: '', level: 'a', mpCost: 'b' }, { name: 'y', element: 'Fogo', level: 9, mpCost: 3 } ])
        expect(overview.byLevel).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0 })
        expect(overview.averageMpCost).toBe(2)
        expect(overview.elements).toEqual([ { element: 'Fogo', count: 1, secondary: false } ])
    })
})
