import { canEvolve, evolutionBlockReason, EVOLUTION_POINT_COST, formatEvolutionPoints, getEvolutionPoints, getSpellProgress, getStageProgress, materializeUnlocked, spellStageCount, spellStageKey, spellStageLabel, stageRule, usesStageUnlock, withoutSpell } from '../spellStages'

describe('spellStageCount e spellStageKey', () => {
    it('conta os estágios pelos textos presentes', () => {
        expect(spellStageCount({ stages: [ 'a', 'b', 'c' ] })).toBe(3)
        expect(spellStageCount({ stages: [ 'a', 'b' ] })).toBe(2)
        expect(spellStageCount({ stages: [ 'a' ] })).toBe(1)
        expect(spellStageCount({ stages: [ 'a', null, 'c' ] })).toBe(3)
        expect(spellStageCount({ stages: [] })).toBe(1)
        expect(spellStageCount({})).toBe(1)
    })

    it('chave: id, senão nome', () => {
        expect(spellStageKey({ id: 'x', name: 'Fagulha' })).toBe('x')
        expect(spellStageKey({ name: 'Fagulha' })).toBe('Fagulha')
    })
})

describe('usesStageUnlock', () => {
    it('vale no Magitech padrão', () => {
        expect(usesStageUnlock({ class: 'Arcano' })).toBe(true)
        expect(usesStageUnlock({ class: '' })).toBe(true)
    })

    it('não vale em sistema customizado nem no Roguelite', () => {
        expect(usesStageUnlock({ systemId: 'sistema-1', class: 'Arcano' })).toBe(false)
        expect(usesStageUnlock({ class: 'Arcano' }, 'Roguelite')).toBe(false)
        expect(usesStageUnlock({ class: 'Sem Classe' })).toBe(false)
    })
})

describe('getStageProgress', () => {
    it('magia nova começa no estágio 1, com o 2 como próximo', () => {
        const progress = getStageProgress({}, 'm1', 3, true)
        expect(progress).toMatchObject({ unlocked: 1, active: 1, next: 2, needsMaterialize: true, count: 3 })
    })

    it('usa o estágio liberado gravado e limita o ativo a ele', () => {
        const progress = getStageProgress({ spellUnlocked: { m1: 2 }, spellStages: { m1: 3 } }, 'm1', 3, true)
        expect(progress).toMatchObject({ unlocked: 2, active: 2, next: 3, needsMaterialize: false })
    })

    it('ficha antiga sem spellUnlocked: vale o estágio que o jogador já usava', () => {
        const progress = getStageProgress({ spellStages: { m1: 3 } }, 'm1', 3, true)
        expect(progress).toMatchObject({ unlocked: 3, active: 3, next: null, needsMaterialize: true })
    })

    it('o valor antigo vem do carregamento, não do formulário que já mudou', () => {
        // o jogador carregou a ficha com a magia no estágio 3 e clicou no estágio 1: continua com 3 liberados
        const progress = getStageProgress({ spellStages: { m1: 1 } }, 'm1', 3, true, { m1: 3 })
        expect(progress).toMatchObject({ unlocked: 3, active: 1 })
    })

    it('não passa do número de estágios que a magia tem', () => {
        expect(getStageProgress({ spellUnlocked: { m1: 3 } }, 'm1', 2, true)).toMatchObject({ unlocked: 2, next: null })
    })

    it('valores inválidos viram estágio 1', () => {
        expect(getStageProgress({ spellUnlocked: { m1: 'x' }, spellStages: { m1: 0 } }, 'm1', 3, true)).toMatchObject({ unlocked: 1, active: 1 })
        expect(getStageProgress({ spellUnlocked: { m1: 9 } }, 'm1', 3, true)).toMatchObject({ unlocked: 3 })
    })

    it('sem a regra (customizado/Roguelite): tudo liberado e o estágio ativo vale como sempre', () => {
        const progress = getStageProgress({ spellStages: { m1: 2 } }, 'm1', 3, false)
        expect(progress).toMatchObject({ enabled: false, unlocked: 3, active: 2, next: null, needsMaterialize: false })
    })
})

describe('materializeUnlocked e withoutSpell', () => {
    it('grava o liberado de ficha antiga e não mexe quando já está gravado', () => {
        const legacy = getStageProgress({ spellStages: { m1: 3 } }, 'm1', 3, true)
        expect(materializeUnlocked({}, 'm1', legacy)).toEqual({ m1: 3 })

        const saved = getStageProgress({ spellUnlocked: { m1: 2 } }, 'm1', 3, true)
        const map = { m1: 2 }
        expect(materializeUnlocked(map, 'm1', saved)).toBe(map)
    })

    it('não grava nada sem a regra', () => {
        const off = getStageProgress({ spellStages: { m1: 3 } }, 'm1', 3, false)
        expect(materializeUnlocked(undefined, 'm1', off)).toEqual({})
    })

    it('remove só a magia pedida', () => {
        expect(withoutSpell({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 })
        expect(withoutSpell(undefined, 'a')).toEqual({})
    })
})

describe('ponto de evolução', () => {
    it('lê points.evolution; ficha antiga ou valor inválido vale 0', () => {
        expect(getEvolutionPoints({ evolution: 3 })).toBe(3)
        expect(getEvolutionPoints({ evolution: '2' })).toBe(2)
        expect(getEvolutionPoints({})).toBe(0)
        expect(getEvolutionPoints(undefined)).toBe(0)
        expect(getEvolutionPoints({ evolution: -1 })).toBe(0)
        expect(getEvolutionPoints({ evolution: 'x' })).toBe(0)
    })

    it('o custo padrão (níveis 1 e 2) é 1 ponto', () => {
        expect(EVOLUTION_POINT_COST).toBe(1)
    })

    it('só evolui com a regra valendo, estágio seguinte e ponto de evolução', () => {
        const progress = getStageProgress({}, 'm1', 3, true)
        expect(canEvolve(progress, 1)).toBe(true)
        expect(canEvolve(progress, 0)).toBe(false)

        const maxed = getStageProgress({ spellUnlocked: { m1: 3 } }, 'm1', 3, true)
        expect(canEvolve(maxed, 5)).toBe(false)

        const noRule = getStageProgress({}, 'm1', 3, false)
        expect(canEvolve(noRule, 5)).toBe(false)
    })
})

describe('stageRule: custo de cada estágio', () => {
    it('o estágio 1 todo mundo tem', () => {
        expect(stageRule({ level: 4, element: 'FOGO' }, 1)).toEqual({ stage: 1, access: 'start', cost: 0 })
    })

    it('nível 1 e 2: 1 ponto por estágio', () => {
        for (const level of [ 1, 2 ]) {
            expect(stageRule({ level, element: 'FOGO' }, 2)).toMatchObject({ access: 'points', cost: 1 })
            expect(stageRule({ level, element: 'FOGO' }, 3)).toMatchObject({ access: 'points', cost: 1 })
        }
    })

    it('nível 3: 2 pontos por estágio', () => {
        expect(stageRule({ level: 3, element: 'ÁGUA' }, 2)).toMatchObject({ access: 'points', cost: 2 })
        expect(stageRule({ level: 3, element: 'ÁGUA' }, 3)).toMatchObject({ access: 'points', cost: 2 })
        expect(stageRule({ level: '3', element: 'ÁGUA' }, 2)).toMatchObject({ cost: 2 })
    })

    it('nível 4 primário: 3 pontos no estágio 2 e a Maestria só pela maestria no elemento', () => {
        expect(stageRule({ level: 4, element: 'FOGO' }, 2)).toMatchObject({ access: 'points', cost: 3 })
        expect(stageRule({ level: 4, element: 'FOGO' }, 3)).toMatchObject({ access: 'mastery', cost: 0 })
    })

    it('nível 4 secundário: 3 pontos em cada estágio, inclusive o 3', () => {
        for (const element of [ 'SANGUE', 'Vácuo', 'PSÍQUICO', 'RADIAÇÃO', 'EXPLOSÃO' ]) {
            expect(stageRule({ level: 4, element }, 2)).toMatchObject({ access: 'points', cost: 3 })
            expect(stageRule({ level: 4, element }, 3)).toMatchObject({ access: 'points', cost: 3 })
        }
    })

    it('rótulo: no nível 4 o terceiro estágio é a Maestria', () => {
        expect(spellStageLabel(4, 3)).toBe('Maestria')
        expect(spellStageLabel('4', 3)).toBe('Maestria')
        expect(spellStageLabel(4, 2)).toBe('Estágio 2')
        expect(spellStageLabel(3, 3)).toBe('Estágio 3')
    })

    it('formata a quantidade de pontos', () => {
        expect(formatEvolutionPoints(1)).toBe('1 ponto de evolução')
        expect(formatEvolutionPoints(3)).toBe('3 pontos de evolução')
    })
})

describe('getSpellProgress', () => {
    const fireL4 = { id: 'f4', name: 'Inferno', level: 4, element: 'FOGO', stages: [ 'a', 'b', 'c' ] }
    const bloodL4 = { id: 'b4', name: 'Hemorragia', level: 4, element: 'SANGUE', stages: [ 'a', 'b', 'c' ] }
    const waterL3 = { id: 'w3', name: 'Maré', level: 3, element: 'ÁGUA', stages: [ 'a', 'b', 'c' ] }

    it('magia nova de nível 3: próximo estágio custa 2 pontos', () => {
        const progress = getSpellProgress(waterL3, {}, { enabled: true })
        expect(progress).toMatchObject({ unlocked: 1, active: 1, next: 2, nextCost: 2, needsMastery: false, purchased: 1 })
        expect(progress.stages.map(s => s.status)).toEqual([ 'unlocked', 'next', 'locked' ])
        expect(progress.stages.map(s => s.rule.cost)).toEqual([ 0, 2, 2 ])
    })

    it('nível 4 primário sem maestria: estágio 2 custa 3 e a Maestria não se compra', () => {
        const first = getSpellProgress(fireL4, {}, { enabled: true })
        expect(first).toMatchObject({ next: 2, nextCost: 3, needsMastery: false })

        const second = getSpellProgress(fireL4, { spellUnlocked: { f4: 2 } }, { enabled: true })
        expect(second).toMatchObject({ unlocked: 2, next: 3, nextCost: null, needsMastery: true })
        expect(canEvolve(second, 99)).toBe(false)
    })

    it('nível 4 primário com maestria no elemento: a Maestria abre sozinha depois do estágio 2', () => {
        const withMastery = { elementalMastery: 'Fogo', spellUnlocked: { f4: 2 }, spellStages: { f4: 3 } }
        const progress = getSpellProgress(fireL4, withMastery, { enabled: true })
        expect(progress).toMatchObject({ unlocked: 3, active: 3, next: null, nextCost: null, needsMastery: false, purchased: 2 })
        expect(progress.stages[2]).toMatchObject({ status: 'unlocked', byMastery: true })
        expect(progress.stages[1]).toMatchObject({ byMastery: false })
    })

    it('a maestria só vale depois de liberar o estágio 2', () => {
        const progress = getSpellProgress(fireL4, { elementalMastery: 'FOGO' }, { enabled: true })
        expect(progress).toMatchObject({ unlocked: 1, next: 2, nextCost: 3 })
    })

    it('maestria em outro elemento não ajuda', () => {
        const progress = getSpellProgress(fireL4, { elementalMastery: 'ÁGUA', spellUnlocked: { f4: 2 } }, { enabled: true })
        expect(progress).toMatchObject({ unlocked: 2, needsMastery: true })
    })

    it('nível 4 secundário: o estágio 3 se compra por 3 pontos, mesmo com a maestria do elemento', () => {
        const progress = getSpellProgress(bloodL4, { elementalMastery: 'Sangue', spellUnlocked: { b4: 2 } }, { enabled: true })
        expect(progress).toMatchObject({ unlocked: 2, next: 3, nextCost: 3, needsMastery: false })
        expect(canEvolve(progress, 3)).toBe(true)
        expect(canEvolve(progress, 2)).toBe(false)
    })

    it('o ativo escolhido não passa do liberado', () => {
        const progress = getSpellProgress(waterL3, { spellUnlocked: { w3: 1 }, spellStages: { w3: 3 } }, { enabled: true })
        expect(progress.active).toBe(1)
    })

    it('ficha antiga: o liberado gravado é o comprado, não o que a maestria abriu', () => {
        const progress = getSpellProgress(fireL4, { elementalMastery: 'FOGO', spellStages: { f4: 2 } }, { enabled: true })
        expect(progress).toMatchObject({ purchased: 2, unlocked: 3, needsMaterialize: true })
        expect(materializeUnlocked({}, 'f4', progress)).toEqual({ f4: 2 })
    })

    it('sem a regra (customizado/Roguelite): tudo liberado, sem custo nem maestria', () => {
        const progress = getSpellProgress(fireL4, { spellStages: { f4: 2 } }, { enabled: false })
        expect(progress).toMatchObject({ enabled: false, unlocked: 3, active: 2, next: null, nextCost: null, needsMastery: false })
        expect(progress.stages.every(s => s.status === 'unlocked' && !s.byMastery)).toBe(true)
    })

    it('magia com 2 estágios não tem Maestria nem terceiro', () => {
        const spell = { id: 's', level: 4, element: 'FOGO', stages: [ 'a', 'b' ] }
        const progress = getSpellProgress(spell, { elementalMastery: 'FOGO', spellUnlocked: { s: 2 } }, { enabled: true })
        expect(progress).toMatchObject({ count: 2, unlocked: 2, next: null })
        expect(progress.stages).toHaveLength(2)
    })

    it('usa o nome quando a magia não tem id', () => {
        const progress = getSpellProgress({ name: 'Fagulha', level: 1, element: 'FOGO', stages: [ 'a', 'b', 'c' ] }, { spellUnlocked: { Fagulha: 3 } }, { enabled: true })
        expect(progress.unlocked).toBe(3)
    })
})

describe('canEvolve com custo e evolutionBlockReason', () => {
    const waterL3 = { id: 'w3', level: 3, element: 'ÁGUA', stages: [ 'a', 'b', 'c' ] }

    it('exige pontos suficientes para o custo da magia', () => {
        const progress = getSpellProgress(waterL3, {}, { enabled: true })
        expect(canEvolve(progress, 1)).toBe(false)
        expect(canEvolve(progress, 2)).toBe(true)
    })

    it('explica o que falta', () => {
        const progress = getSpellProgress(waterL3, {}, { enabled: true })
        expect(evolutionBlockReason(progress, 0, 'ÁGUA')).toBe('Faltam 2 pontos de evolução (você tem 0). Peça ao mestre.')
        expect(evolutionBlockReason(progress, 1, 'ÁGUA')).toBe('Faltam 1 ponto de evolução (você tem 1). Peça ao mestre.')
        expect(evolutionBlockReason(progress, 2, 'ÁGUA')).toBeNull()
    })

    it('a Maestria sem a maestria no elemento explica que não se compra', () => {
        const fire = { id: 'f4', level: 4, element: 'FOGO', stages: [ 'a', 'b', 'c' ] }
        const progress = getSpellProgress(fire, { spellUnlocked: { f4: 2 } }, { enabled: true })
        expect(evolutionBlockReason(progress, 9, 'FOGO')).toBe('Abre sozinho com maestria em fogo; não se compra com pontos')
    })

    it('sem o que evoluir ou sem a regra não há bloqueio', () => {
        const maxed = getSpellProgress(waterL3, { spellUnlocked: { w3: 3 } }, { enabled: true })
        expect(evolutionBlockReason(maxed, 0, 'ÁGUA')).toBeNull()
        expect(evolutionBlockReason(getSpellProgress(waterL3, {}, { enabled: false }), 0, 'ÁGUA')).toBeNull()
    })
})
