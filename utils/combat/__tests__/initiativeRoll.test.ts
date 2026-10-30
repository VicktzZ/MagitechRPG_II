import type { AppliedEffect } from '@models'
import { creatureInitiativeDice, describeInitiativeEffects, describeInitiativeRolls, initiativeWithEffects, playerInitiativeDice, resolveInitiative } from '../initiativeRoll'

describe('playerInitiativeDice', () => {
    it('regra única de d20: modificador do atributo padrão da Agilidade + 1 dados, e o valor da perícia', () => {
        const sheet = { expertises: { Agilidade: { value: 3, defaultAttribute: 'des' } }, mods: { attributes: { des: 2, vig: 4 } } }
        expect(playerInitiativeDice(sheet)).toEqual({ numDice: 3, expertiseValue: 3 })
        expect(playerInitiativeDice({ ...sheet, mods: { attributes: { des: 0 } } })).toEqual({ numDice: 1, expertiseValue: 3 })
        expect(playerInitiativeDice({ expertises: { Agilidade: { value: 1, defaultAttribute: 'vig' } }, mods: { attributes: { vig: 4 } } })).toEqual({ numDice: 5, expertiseValue: 1 })
    })

    it('modificador negativo rola 2 d20 e vale o menor', () => {
        const sheet = { expertises: { Agilidade: { value: 3, defaultAttribute: 'des' } }, mods: { attributes: { des: -1 } } }
        expect(playerInitiativeDice(sheet)).toEqual({ numDice: 2, expertiseValue: 3, keep: 'lowest' })
        expect(resolveInitiative(playerInitiativeDice(sheet), { d20: (() => { const v = [ 15, 4 ]; let i = 0; return () => v[i++] ?? 1 })() })).toEqual({ rolls: [ 15, 4 ], roll: 4, total: 7 })
    })

    it('ficha sem os dados cai em 1d20 +0', () => {
        expect(playerInitiativeDice({})).toEqual({ numDice: 1, expertiseValue: 0 })
        expect(playerInitiativeDice(null)).toEqual({ numDice: 1, expertiseValue: 0 })
        expect(playerInitiativeDice({ expertises: { Agilidade: { value: 'x' } }, mods: { attributes: { des: 'y' } } })).toEqual({ numDice: 1, expertiseValue: 0 })
    })
})

describe('creatureInitiativeDice', () => {
    it('regra única de d20 sobre o modificador da criatura (⌊atributo ÷ 5⌋, até 5): modificador + 1 dados', () => {
        const at = (des: number) => creatureInitiativeDice({ expertises: { Agilidade: { value: 2, defaultAttribute: 'des' } }, attributes: { des } })
        expect(at(4)).toEqual({ numDice: 1, expertiseValue: 2 })
        expect(at(5)).toEqual({ numDice: 2, expertiseValue: 2 })
        expect(at(10)).toEqual({ numDice: 3, expertiseValue: 2 })
        expect(at(15)).toEqual({ numDice: 4, expertiseValue: 2 })
        expect(at(99)).toEqual({ numDice: 6, expertiseValue: 2 })
    })

    it('atributo zero (modificador −1) rola 2 d20 e vale o menor', () => {
        expect(creatureInitiativeDice({ expertises: { Agilidade: { value: 2, defaultAttribute: 'des' } }, attributes: { des: 0 } })).toEqual({ numDice: 2, expertiseValue: 2, keep: 'lowest' })
    })

    it('criatura que não existe mais rola 1d20 +0', () => {
        expect(creatureInitiativeDice(undefined)).toEqual({ numDice: 1, expertiseValue: 0 })
    })
})

describe('resolveInitiative', () => {
    const seq = (...values: number[]) => { let i = 0; return () => values[i++] ?? 1 }

    it('vale o maior dado e soma a perícia', () => {
        expect(resolveInitiative({ numDice: 3, expertiseValue: 2 }, { d20: seq(4, 17, 9) })).toEqual({ rolls: [ 4, 17, 9 ], roll: 17, total: 19 })
        expect(resolveInitiative({ numDice: 1, expertiseValue: -1 }, { d20: seq(12) })).toEqual({ rolls: [ 12 ], roll: 12, total: 11 })
    })

    it('o resultado dito pelo mestre dispensa a rolagem', () => {
        expect(resolveInitiative({ numDice: 2, expertiseValue: 3 }, { manual: 14, d20: seq(1, 1) })).toEqual({ rolls: [], roll: 14, total: 17 })
        expect(resolveInitiative({ numDice: 1, expertiseValue: 0 }, { manual: 0, d20: seq(8) }).roll).toBe(8)
    })

    it('o dado real fica entre 1 e 20', () => {
        for (let i = 0; i < 200; i++) {
            const { roll } = resolveInitiative({ numDice: 2, expertiseValue: 0 })
            expect(roll).toBeGreaterThanOrEqual(1)
            expect(roll).toBeLessThanOrEqual(20)
        }
    })
})

describe('describeInitiativeRolls', () => {
    it('um dado: só o número; vários: lista e o escolhido; manual: só o número', () => {
        expect(describeInitiativeRolls({ rolls: [ 12 ], roll: 12 })).toBe('[12]')
        expect(describeInitiativeRolls({ rolls: [ 4, 17 ], roll: 17 })).toBe('[4, 17]: 17')
        expect(describeInitiativeRolls({ rolls: [], roll: 14 })).toBe('14')
    })
})

describe('playerInitiativeDice com Sobrepeso', () => {
    const sheet = { expertises: { Agilidade: { value: 3, defaultAttribute: 'des' } }, mods: { attributes: { des: 2 } }, ...{ capacity: { max: 8 }, inventory: { weapons: [ { id: 'w1', name: 'Marreta', weight: 10 } ] } } }

    it('Agilidade é perícia de DES: 2 kg acima da capacidade tiram 2 do bônus da iniciativa', () => {
        expect(playerInitiativeDice(sheet)).toEqual({ numDice: 3, expertiseValue: 1 })
    })

    it('sem excesso de peso, ou com a perícia ligada a outro atributo, nada muda', () => {
        expect(playerInitiativeDice({ ...sheet, capacity: { max: 40 } })).toEqual({ numDice: 3, expertiseValue: 3 })
        expect(playerInitiativeDice({ ...sheet, expertises: { Agilidade: { value: 3, defaultAttribute: 'foc' } }, mods: { attributes: { foc: 2 } } })).toEqual({ numDice: 3, expertiseValue: 3 })
    })
})

describe('iniciativa com os efeitos aplicados (Fase 6.3)', () => {
    const effect = (name: string, modifiers: Array<Record<string, unknown>>): AppliedEffect =>
        ({ id: name, effectId: name, level: 1, remaining: 2, snapshot: { name, levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect
    const seq = (...values: number[]) => { let i = 0; return () => values[i++] ?? 1 }

    const velocidade = effect('Velocidade', [ { kind: 'stat_bonus', target: 'initiative', value: 2 } ])
    const lentidao = effect('Lentidão', [ { kind: 'stat_penalty', target: 'initiative', value: 3 } ])
    const sorte = effect('Sorte', [ { kind: 'advantage', target: 'initiative' } ])
    const azar = effect('Azar', [ { kind: 'disadvantage', target: 'initiative' } ])

    it('sem efeito os dados ficam como vieram', () => {
        const dice = { numDice: 2, expertiseValue: 3 }
        expect(initiativeWithEffects(dice, [])).toBe(dice)
        expect(initiativeWithEffects(dice, undefined)).toBe(dice)
        expect(initiativeWithEffects(dice, [ effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ]) ])).toMatchObject({ numDice: 2, keep: 'highest', effectBonus: 0 })
    })

    it('o bônus fixo soma ao total, além da perícia, e a penalidade tira', () => {
        const fast = initiativeWithEffects({ numDice: 1, expertiseValue: 3 }, [ velocidade ])
        expect(fast).toMatchObject({ effectBonus: 2, effectNotes: [ '+2 de Velocidade' ] })
        expect(resolveInitiative(fast, { d20: seq(10) })).toEqual({ rolls: [ 10 ], roll: 10, total: 15 })
        expect(resolveInitiative(fast, { manual: 14 })).toEqual({ rolls: [], roll: 14, total: 19 })

        const slow = initiativeWithEffects({ numDice: 1, expertiseValue: 3 }, [ velocidade, lentidao ])
        expect(slow.effectBonus).toBe(-1)
        expect(resolveInitiative(slow, { d20: seq(10) }).total).toBe(12)
    })

    it('vantagem rola um d20 a mais e vale o maior; desvantagem sem dado extra rola dois e vale o menor', () => {
        const lucky = initiativeWithEffects({ numDice: 1, expertiseValue: 0 }, [ sorte ])
        expect(lucky).toMatchObject({ numDice: 2, keep: 'highest' })
        expect(resolveInitiative(lucky, { d20: seq(4, 17) }).roll).toBe(17)

        const unlucky = initiativeWithEffects({ numDice: 1, expertiseValue: 0 }, [ azar ])
        expect(unlucky).toMatchObject({ numDice: 2, keep: 'lowest' })
        expect(resolveInitiative(unlucky, { d20: seq(4, 17) })).toEqual({ rolls: [ 4, 17 ], roll: 4, total: 4 })
    })

    it('a conta é a do saldo: vantagem e desvantagem se anulam e os d20 do mod entram como vantagens', () => {
        expect(initiativeWithEffects({ numDice: 1, expertiseValue: 0 }, [ sorte, azar ])).toMatchObject({ numDice: 1, keep: 'highest' })
        // 3 d20 do mod = saldo 2; uma desvantagem deixa saldo 1: 2 dados, vale o maior
        expect(initiativeWithEffects({ numDice: 3, expertiseValue: 0 }, [ azar ])).toMatchObject({ numDice: 2, keep: 'highest' })
    })

    it('o log diz de onde vem o bônus e os d20', () => {
        const dice = initiativeWithEffects({ numDice: 1, expertiseValue: 0 }, [ velocidade, azar ])
        expect(describeInitiativeEffects(dice)).toBe(' [Azar: desvantagem, −1d20; +2 de Velocidade]')
        expect(describeInitiativeEffects({ numDice: 1, expertiseValue: 0 })).toBe('')
    })
})
