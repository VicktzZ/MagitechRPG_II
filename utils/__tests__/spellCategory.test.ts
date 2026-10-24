import { filterBySelections } from '../filterSelection'
import {
    getSpellCategories,
    getSpellCategory,
    getSpellExecution,
    getSpellSubtypes,
    SPELL_CATEGORIES,
    SPELL_EXECUTION_FILTER,
    SPELL_FILTERS,
    SPELL_SUBTYPES,
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

describe('Reação é execução, não subtipo', () => {
    it('"(Reação)" no type não vira subtipo', () => {
        expect(getSpellSubtypes('Defesa (Reação)')).toEqual([])
        expect(getSpellSubtypes('Ataque (Reação)')).toEqual([])
        expect(getSpellSubtypes('Defesa (imediato/Reação)')).toEqual([ 'Imediato' ])
    })

    it('Reação não está na lista de subtipos do filtro', () => {
        expect(SPELL_SUBTYPES).not.toContain('Reação')
    })
})

describe('getSpellExecution', () => {
    it.each([
        [ 'Padrão', 'Padrão' ],
        [ 'padrão', 'Padrão' ],
        [ 'Reação', 'Reação' ],
        [ 'reacao', 'Reação' ],
        [ ' Completa ', 'Completa' ],
        [ 'Movimento', 'Movimento' ],
        [ 'Livre', 'Livre' ],
        [ 'bônus', 'Bônus' ]
    ])('%s → %s', (execution, expected) => {
        expect(getSpellExecution(execution)).toEqual([ expected ])
    })

    it('sem execução devolve lista vazia', () => {
        expect(getSpellExecution(undefined)).toEqual([])
        expect(getSpellExecution(null)).toEqual([])
        expect(getSpellExecution('  ')).toEqual([])
    })

    it('a lista do filtro cobre as execuções do catálogo', () => {
        expect(SPELL_EXECUTION_FILTER.options).toEqual([ 'Padrão', 'Completa', 'Movimento', 'Livre', 'Reação' ])
    })
})

describe('filtro Execução combinado com Tipo e Subtipo', () => {
    const spells = [
        { name: 'Nova reação', type: 'Controle (imediato)', execution: 'Reação' },
        { name: 'Antiga com (Reação)', type: 'Defesa (Reação)', execution: 'Reação' },
        { name: 'Defesa imediata reativa', type: 'Defesa (imediato)', execution: 'Reação' },
        { name: 'Defesa padrão', type: 'Defesa (imediato)', execution: 'Padrão' },
        { name: 'Ataque minúsculo', type: 'Ataque (conjurado)', execution: 'padrão' },
        { name: 'Ataque completo', type: 'Ataque (imediato)', execution: 'Completa' }
    ]
    const [ typeMenu, executionMenu ] = SPELL_FILTERS
    const apply = (types: string[], subtypes: string[], executions: string[]) => filterBySelections(spells, [
        { getValue: typeMenu.getValue, selected: types },
        { getValue: SPELL_TYPE_FILTER.subFilter.getValue, selected: subtypes },
        { getValue: executionMenu.getValue, selected: executions }
    ]).map(s => s.name)

    it('só Execução = Reação lista todas as reações, com ou sem "(Reação)" no type', () => {
        expect(apply([], [], [ 'Reação' ])).toEqual([ 'Nova reação', 'Antiga com (Reação)', 'Defesa imediata reativa' ])
    })

    it('"padrão" em minúsculas conta como Padrão', () => {
        expect(apply([], [], [ 'Padrão' ])).toEqual([ 'Defesa padrão', 'Ataque minúsculo' ])
    })

    it('várias execuções: OU entre elas', () => {
        expect(apply([], [], [ 'Padrão', 'Completa' ])).toEqual([ 'Defesa padrão', 'Ataque minúsculo', 'Ataque completo' ])
    })

    it('Execução + Tipo + Subtipo: precisa passar pelos três', () => {
        expect(apply([ 'Defesa' ], [ 'Imediato' ], [ 'Reação' ])).toEqual([ 'Defesa imediata reativa' ])
        expect(apply([ 'Defesa' ], [ 'Imediato' ], [ 'Padrão' ])).toEqual([ 'Defesa padrão' ])
        expect(apply([ 'Ataque' ], [], [ 'Reação' ])).toEqual([])
    })

    it('só o Subtipo continua funcionando sozinho', () => {
        expect(apply([], [ 'Imediato' ], [])).toEqual([ 'Nova reação', 'Defesa imediata reativa', 'Defesa padrão', 'Ataque completo' ])
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

describe('categoria Recuperação (magias que devolvem MP)', () => {
    it('está na lista do filtro Tipo, em ordem alfabética', () => {
        expect(SPELL_CATEGORIES).toContain('Recuperação')
        expect(SPELL_TYPE_FILTER.options).toContain('Recuperação')
        expect([ ...SPELL_CATEGORIES ]).toEqual([ ...SPELL_CATEGORIES ].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    })

    it('sozinha ou somada a outra categoria', () => {
        expect(getSpellCategories('Recuperação (contínuo)')).toEqual([ 'Recuperação' ])
        expect(getSpellCategories('Ataque/Recuperação (imediato)')).toEqual([ 'Ataque', 'Recuperação' ])
        expect(getSpellCategories('Cura/Ataque/Recuperação (Imediato)')).toEqual([ 'Cura', 'Ataque', 'Recuperação' ])
    })

    it('aceita a grafia sem acento ou em outra caixa e devolve a forma canônica', () => {
        expect(getSpellCategories('recuperacao (imediato)')).toEqual([ 'Recuperação' ])
        expect(getSpellCategories('RECUPERAÇÃO (imediato)')).toEqual([ 'Recuperação' ])
        expect(getSpellCategories('ataque/Recuperacao (imediato)')).toEqual([ 'Ataque', 'Recuperação' ])
        expect(getSpellCategories('ilusao (contínuo)')).toEqual([ 'Ilusão' ])
    })

    it('categoria desconhecida continua só com a inicial maiúscula', () => {
        expect(getSpellCategories('invocação (imediato)')).toEqual([ 'Invocação' ])
    })

    describe('filtro Tipo = Recuperação', () => {
        const spells = [
            { name: 'Só recupera', type: 'Recuperação (contínuo)' },
            { name: 'Ataque que recupera', type: 'Ataque/Recuperação (imediato)' },
            { name: 'Cura que recupera', type: 'Cura/Recuperação (Conjurado, Contínuo)' },
            { name: 'Ataque comum', type: 'Ataque (imediato)' },
            { name: 'Cura comum', type: 'Cura (contínuo)' },
            { name: 'Sem recuperação (subtipo não é tipo)', type: 'Defesa (Recuperação)' }
        ]
        const apply = (types: string[], subtypes: string[] = []) => filterBySelections(spells, [
            { getValue: SPELL_TYPE_FILTER.getValue, selected: types },
            { getValue: SPELL_TYPE_FILTER.subFilter.getValue, selected: subtypes }
        ]).map(s => s.name)

        it('lista as que só recuperam e as que somam outra categoria', () => {
            expect(apply([ 'Recuperação' ])).toEqual([ 'Só recupera', 'Ataque que recupera', 'Cura que recupera' ])
        })

        it('as categorias somadas continuam aparecendo no filtro da outra categoria', () => {
            expect(apply([ 'Ataque' ])).toEqual([ 'Ataque que recupera', 'Ataque comum' ])
            expect(apply([ 'Cura' ])).toEqual([ 'Cura que recupera', 'Cura comum' ])
        })

        it('Recuperação + Subtipo: precisa passar pelos dois', () => {
            expect(apply([ 'Recuperação' ], [ 'Contínuo' ])).toEqual([ 'Só recupera', 'Cura que recupera' ])
            expect(apply([ 'Recuperação' ], [ 'Imediato' ])).toEqual([ 'Ataque que recupera' ])
        })

        it('Recuperação ou Ataque: OU entre as categorias', () => {
            expect(apply([ 'Recuperação', 'Ataque' ])).toEqual([ 'Só recupera', 'Ataque que recupera', 'Cura que recupera', 'Ataque comum' ])
        })
    })
})
