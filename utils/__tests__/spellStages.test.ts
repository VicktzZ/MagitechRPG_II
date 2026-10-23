import { getStageProgress, materializeUnlocked, spellStageCount, spellStageKey, usesStageUnlock, withoutSpell } from '../spellStages'

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
