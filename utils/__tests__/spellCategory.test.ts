import { filterBySelections } from '../filterSelection'
import {
    getSpellCategories,
    getSpellCategory,
    getSpellExecution,
    getSpellSubtypes,
    getSpellLevel,
    REMOVED_CATEGORY_REPLACEMENT,
    REMOVED_SUBTYPES,
    SPELL_CATEGORIES,
    SPELL_EXECUTION_FILTER,
    SPELL_FILTERS,
    SPELL_LEVEL_FILTER,
    SPELL_LEVELS,
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
        expect(getSpellSubtypes('Ataque (imediato/Área)')).toEqual([ 'Imediato', 'Área' ])
        expect(getSpellSubtypes('Ataque (imediato/Invocação)')).toEqual([ 'Imediato', 'Invocação' ])
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
        [ 'Livre', 'Bônus' ],
        [ 'livre', 'Bônus' ],
        [ 'Bônus', 'Bônus' ],
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
        expect(SPELL_EXECUTION_FILTER.options).toEqual([ 'Padrão', 'Completa', 'Movimento', 'Bônus', 'Reação' ])
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
    const typeMenu = SPELL_TYPE_FILTER
    const executionMenu = SPELL_EXECUTION_FILTER
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
        expect(getSpellCategories('suporte (contínuo)')).toEqual([ 'Suporte' ])
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

describe('categorias removidas: Buff, Debuff, Ilusão e Anulação', () => {
    it('não estão mais na lista do filtro Tipo', () => {
        for (const removed of [ 'Buff', 'Debuff', 'Ilusão', 'Anulação' ]) {
            expect(SPELL_CATEGORIES).not.toContain(removed)
            expect(SPELL_TYPE_FILTER.options).not.toContain(removed)
        }
        expect(SPELL_CATEGORIES).toEqual(expect.arrayContaining([ 'Suporte', 'Controle', 'Utilidade', 'Movimento' ]))
    })

    it('o texto antigo vale como a categoria nova: Buff → Suporte; Debuff, Ilusão e Anulação → Controle', () => {
        expect(getSpellCategories('Buff (contínuo)')).toEqual([ 'Suporte' ])
        expect(getSpellCategories('debuff (imediato)')).toEqual([ 'Controle' ])
        expect(getSpellCategories('Ilusão (contínuo)')).toEqual([ 'Controle' ])
        expect(getSpellCategories('ilusao (contínuo)')).toEqual([ 'Controle' ])
        expect(getSpellCategories('Anulação (imediato)')).toEqual([ 'Controle' ])
        expect(getSpellCategories('ANULACAO (Reação)')).toEqual([ 'Controle' ])
        expect(REMOVED_CATEGORY_REPLACEMENT).toEqual({ buff: 'Suporte', debuff: 'Controle', ilusao: 'Controle', anulacao: 'Controle' })
    })

    it('combinações não repetem a categoria: Controle/Debuff → Controle; Suporte/Buff → Suporte', () => {
        expect(getSpellCategories('Controle/Debuff (imediato)')).toEqual([ 'Controle' ])
        expect(getSpellCategories('Suporte/Buff (contínuo)')).toEqual([ 'Suporte' ])
        expect(getSpellCategories('Ataque/Debuff (imediato)')).toEqual([ 'Ataque', 'Controle' ])
    })

    it('o filtro "Controle" encontra o que era Debuff, Ilusão e Anulação, e "Suporte" o que era Buff', () => {
        const spells = [
            { name: 'A', type: 'Debuff (imediato)' },
            { name: 'B', type: 'Ilusão (contínuo)' },
            { name: 'C', type: 'Anulação (imediato)' },
            { name: 'D', type: 'Buff (contínuo)' },
            { name: 'E', type: 'Controle (imediato)' },
            { name: 'F', type: 'Ataque (imediato)' }
        ]
        const apply = (types: string[]) => filterBySelections(spells, [ { getValue: SPELL_TYPE_FILTER.getValue, selected: types } ]).map(spell => spell.name)

        expect(apply([ 'Controle' ])).toEqual([ 'A', 'B', 'C', 'E' ])
        expect(apply([ 'Suporte' ])).toEqual([ 'D' ])
        expect(apply([ 'Buff' ])).toEqual([])
    })
})

describe('subtipos removidos: Sacrifício, Multiplicador, Condicional e Adjacente', () => {
    it.each([
        [ 'Ataque (Sacrifício)' ],
        [ 'Ataque (sacrificial)' ],
        [ 'Ataque (Multiplicador)' ],
        [ 'Controle (condicional)' ],
        [ 'Defesa (Adjacente)' ]
    ])('%s não tem subtipo', (type) => {
        expect(getSpellSubtypes(type)).toEqual([])
    })

    it('some do meio de uma combinação e o resto fica', () => {
        expect(getSpellSubtypes('Ataque (Área/Sacrifício)')).toEqual([ 'Área' ])
        expect(getSpellSubtypes('Controle (imediato/Condicional)')).toEqual([ 'Imediato' ])
        expect(getSpellSubtypes('Ataque (Conjurado, Multiplicador, Contínuo)')).toEqual([ 'Conjurado', 'Contínuo' ])
        expect(REMOVED_SUBTYPES).toEqual([ 'sacrificio', 'sacrificial', 'multiplicador', 'condicional', 'adjacente' ])
    })

    it('o filtro Subtipo oferece só os subtipos vigentes, sem depender do que foi carregado', () => {
        expect(SPELL_SUBTYPES).toEqual([ 'Imediato', 'Conjurado', 'Contínuo', 'Sustentado', 'Área', 'Completo', 'Invocação' ])
        expect(SPELL_TYPE_FILTER.subFilter.options).toEqual(SPELL_SUBTYPES)
    })
})

describe('filtro Nível', () => {
    it('as opções são os níveis 1 a 4 e o rótulo é "Nível"', () => {
        expect(SPELL_LEVELS).toEqual([ '1', '2', '3', '4' ])
        expect(SPELL_LEVEL_FILTER.label).toBe('Nível')
        expect(SPELL_LEVEL_FILTER.options).toEqual(SPELL_LEVELS)
    })

    it.each([
        [ 3, [ '3' ] ],
        [ '2', [ '2' ] ],
        [ 1.9, [ '1' ] ],
        [ 0, [] ],
        [ -1, [] ],
        [ 'abc', [] ],
        [ undefined, [] ],
        [ null, [] ]
    ])('getSpellLevel(%p)', (level, expected) => {
        expect(getSpellLevel(level)).toEqual(expected)
    })

    it('está nos menus de filtro das listas de magias, depois de Tipo e Execução', () => {
        expect(SPELL_FILTERS.map(menu => menu.label)).toEqual([ 'Tipo', 'Execução', 'Nível' ])
    })

    describe('combinado com os outros filtros', () => {
        const spells = [
            { name: 'N1 Ataque', type: 'Ataque (imediato)', level: 1, execution: 'Padrão' },
            { name: 'N1 Defesa', type: 'Defesa (contínuo)', level: '1', execution: 'Reação' },
            { name: 'N2 Ataque', type: 'Ataque (conjurado)', level: 2, execution: 'Padrão' },
            { name: 'N3 Cura', type: 'Cura (imediato)', level: 3, execution: 'Completa' },
            { name: 'N4 Ataque', type: 'Ataque (imediato)', level: 4, execution: 'Padrão' },
            { name: 'Sem nível', type: 'Ataque (imediato)', execution: 'Padrão' }
        ]
        const apply = (levels: string[], types: string[] = [], executions: string[] = []) => filterBySelections(spells, [
            { getValue: SPELL_TYPE_FILTER.getValue, selected: types },
            { getValue: SPELL_EXECUTION_FILTER.getValue, selected: executions },
            { getValue: SPELL_LEVEL_FILTER.getValue, selected: levels }
        ]).map(spell => spell.name)

        it('só nível 1 lista só as de nível 1 (número ou texto)', () => {
            expect(apply([ '1' ])).toEqual([ 'N1 Ataque', 'N1 Defesa' ])
        })

        it('só nível 2, só nível 3, só nível 4', () => {
            expect(apply([ '2' ])).toEqual([ 'N2 Ataque' ])
            expect(apply([ '3' ])).toEqual([ 'N3 Cura' ])
            expect(apply([ '4' ])).toEqual([ 'N4 Ataque' ])
        })

        it('vários níveis: OU entre eles', () => {
            expect(apply([ '1', '4' ])).toEqual([ 'N1 Ataque', 'N1 Defesa', 'N4 Ataque' ])
        })

        it('com Tipo e Execução: precisa passar por todos', () => {
            expect(apply([ '1' ], [ 'Ataque' ])).toEqual([ 'N1 Ataque' ])
            expect(apply([ '1', '2', '4' ], [ 'Ataque' ], [ 'Padrão' ])).toEqual([ 'N1 Ataque', 'N2 Ataque', 'N4 Ataque' ])
            expect(apply([ '3' ], [ 'Ataque' ])).toEqual([])
        })

        it('sem nível marcado não filtra (a magia sem nível continua aparecendo)', () => {
            expect(apply([])).toHaveLength(6)
        })
    })
})
