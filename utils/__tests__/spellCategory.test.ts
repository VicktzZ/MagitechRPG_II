import { filterBySelections } from '../filterSelection'
import {
    getSpellCategories,
    getSpellCategory,
    getSpellFilterSubtypes,
    getSpellSubtypes,
    SPELL_TYPE_FILTER
} from '../spellCategory'

describe('getSpellCategory', () => {
    it('devolve o texto antes do parêntese', () => {
        expect(getSpellCategory('Ataque (imediato)')).toBe('Ataque')
        expect(getSpellCategory('Ataque/Cura (imediato)')).toBe('Ataque/Cura')
    })

    it('usa "Outro" quando não há categoria', () => {
        expect(getSpellCategory(undefined)).toBe('Outro')
        expect(getSpellCategory('')).toBe('Outro')
        expect(getSpellCategory('(imediato)')).toBe('Outro')
    })
})

describe('getSpellCategories', () => {
    it('uma categoria', () => {
        expect(getSpellCategories('Defesa (Reação)')).toEqual([ 'Defesa' ])
        expect(getSpellCategories('Ataque')).toEqual([ 'Ataque' ])
    })

    it('combinações viram várias categorias', () => {
        expect(getSpellCategories('Ataque/Cura (imediato)')).toEqual([ 'Ataque', 'Cura' ])
        expect(getSpellCategories('Utilidade/Suporte (Sustentado)')).toEqual([ 'Utilidade', 'Suporte' ])
    })

    it('usa "Outro" quando não há categoria', () => {
        expect(getSpellCategories(undefined)).toEqual([ 'Outro' ])
        expect(getSpellCategories(null)).toEqual([ 'Outro' ])
        expect(getSpellCategories('(imediato)')).toEqual([ 'Outro' ])
    })
})

describe('getSpellSubtypes — variações reais do catálogo', () => {
    it.each([
        [ 'Ataque (imediato)', [ 'Imediato' ] ],
        [ 'Ataque (Imediato)', [ 'Imediato' ] ],
        [ 'Defesa (contínua)', [ 'Contínuo' ] ],
        [ 'Encantamento (Contínuo)', [ 'Contínuo' ] ],
        [ 'Defesa (Sustentada)', [ 'Sustentado' ] ],
        [ 'Transmutação (sustentado)', [ 'Sustentado' ] ],
        [ 'Defesa (Reação)', [ 'Reação' ] ],
        [ 'Ataque (completo)', [ 'Completo' ] ],
        [ 'Ataque (Invocação)', [ 'Invocação' ] ],
        [ 'Ataque (Área)', [ 'Área' ] ]
    ])('%s', (type, expected) => {
        expect(getSpellSubtypes(type)).toEqual(expected)
    })

    it('combinações viram vários subtipos', () => {
        expect(getSpellSubtypes('Cura (Conjurado, Contínuo)')).toEqual([ 'Conjurado', 'Contínuo' ])
        expect(getSpellSubtypes('Ataque (Imediato/Área)')).toEqual([ 'Imediato', 'Área' ])
        expect(getSpellSubtypes('Ataque (Área/Sacrifício)')).toEqual([ 'Área', 'Sacrifício' ])
    })

    it('ignora o texto que sobra depois do parêntese', () => {
        expect(getSpellSubtypes('Transmutação (contínuo) Execução: Padrão Alcance: Pessoal')).toEqual([ 'Contínuo' ])
    })

    it('sem subtipo devolve lista vazia', () => {
        expect(getSpellSubtypes('Ataque')).toEqual([])
        expect(getSpellSubtypes('Ataque ()')).toEqual([])
        expect(getSpellSubtypes(undefined)).toEqual([])
        expect(getSpellSubtypes(null)).toEqual([])
    })
})

describe('getSpellFilterSubtypes — Reação vem também da execução', () => {
    it('reação com "(imediato)" no type entra em Imediato e em Reação', () => {
        expect(getSpellFilterSubtypes({ type: 'Defesa (imediato)', execution: 'Reação' })).toEqual([ 'Imediato', 'Reação' ])
    })

    it('não duplica quando o type já diz Reação', () => {
        expect(getSpellFilterSubtypes({ type: 'Defesa (Reação)', execution: 'Reação' })).toEqual([ 'Reação' ])
    })

    it('aceita a execução sem acento ou em minúsculas', () => {
        expect(getSpellFilterSubtypes({ type: 'Ataque (imediato)', execution: 'reacao' })).toContain('Reação')
    })

    it('outras execuções não ganham subtipo', () => {
        expect(getSpellFilterSubtypes({ type: 'Ataque (imediato)', execution: 'Padrão' })).toEqual([ 'Imediato' ])
        expect(getSpellFilterSubtypes({ type: 'Ataque', execution: undefined })).toEqual([])
    })

    it('o filtro "Reação" lista as reações do catálogo e as novas, e não as outras', () => {
        const spells = [
            { name: 'Nova', type: 'Controle (imediato)', execution: 'Reação' },
            { name: 'Antiga com subtipo', type: 'Defesa (Reação)', execution: 'Reação' },
            { name: 'Antiga imediata', type: 'Defesa (imediato)', execution: 'Reação' },
            { name: 'Comum', type: 'Ataque (imediato)', execution: 'Padrão' }
        ]
        const result = filterBySelections(spells, [
            { getValue: SPELL_TYPE_FILTER.subFilter.getValue, selected: [ 'Reação' ] }
        ]).map(s => s.name)
        expect(result).toEqual([ 'Nova', 'Antiga com subtipo', 'Antiga imediata' ])
    })
})

describe('filtros Tipo + Subtipo', () => {
    const spells = [
        { name: 'A', type: 'Ataque (imediato)' },
        { name: 'B', type: 'Ataque (Conjurado)' },
        { name: 'C', type: 'Defesa (Imediato)' },
        { name: 'D', type: 'Defesa (contínua)' },
        { name: 'E', type: 'Ataque/Cura (imediato)' },
        { name: 'F', type: 'Cura (Conjurado, Contínuo)' },
        { name: 'G', type: 'Ataque' }
    ]
    const apply = (types: string[], subtypes: string[]) => filterBySelections(spells, [
        { getValue: SPELL_TYPE_FILTER.getValue, selected: types },
        { getValue: SPELL_TYPE_FILTER.subFilter.getValue, selected: subtypes }
    ]).map(s => s.name)

    it('sem nada marcado, não filtra', () => {
        expect(apply([], [])).toEqual([ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ])
    })

    it('só o Tipo: todas da categoria (inclusive combinações)', () => {
        expect(apply([ 'Ataque' ], [])).toEqual([ 'A', 'B', 'E', 'G' ])
        expect(apply([ 'Cura' ], [])).toEqual([ 'E', 'F' ])
    })

    it('só o Subtipo: todas as magias com o subtipo, de qualquer tipo', () => {
        expect(apply([], [ 'Imediato' ])).toEqual([ 'A', 'C', 'E' ])
        expect(apply([], [ 'Contínuo' ])).toEqual([ 'D', 'F' ])
        expect(apply([], [ 'Conjurado' ])).toEqual([ 'B', 'F' ])
    })

    it('Tipo e Subtipo juntos: precisa passar pelos dois', () => {
        expect(apply([ 'Ataque' ], [ 'Imediato' ])).toEqual([ 'A', 'E' ])
        expect(apply([ 'Defesa' ], [ 'Imediato' ])).toEqual([ 'C' ])
        expect(apply([ 'Defesa' ], [ 'Conjurado' ])).toEqual([])
    })

    it('várias opções do mesmo filtro: OU entre elas', () => {
        expect(apply([ 'Ataque', 'Defesa' ], [ 'Imediato' ])).toEqual([ 'A', 'C', 'E' ])
        expect(apply([ 'Ataque' ], [ 'Imediato', 'Conjurado' ])).toEqual([ 'A', 'B', 'E' ])
    })
})
