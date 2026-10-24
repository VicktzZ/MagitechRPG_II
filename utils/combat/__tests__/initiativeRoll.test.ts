import { creatureInitiativeDice, describeInitiativeRolls, playerInitiativeDice, resolveInitiative } from '../initiativeRoll'

describe('playerInitiativeDice', () => {
    it('usa o modificador do atributo padrão da Agilidade (mínimo 1) e o valor da perícia', () => {
        const sheet = { expertises: { Agilidade: { value: 3, defaultAttribute: 'des' } }, mods: { attributes: { des: 2, vig: 4 } } }
        expect(playerInitiativeDice(sheet)).toEqual({ numDice: 2, expertiseValue: 3 })
        expect(playerInitiativeDice({ ...sheet, mods: { attributes: { des: 0 } } })).toEqual({ numDice: 1, expertiseValue: 3 })
        expect(playerInitiativeDice({ expertises: { Agilidade: { value: 1, defaultAttribute: 'vig' } }, mods: { attributes: { vig: 4 } } })).toEqual({ numDice: 4, expertiseValue: 1 })
    })

    it('ficha sem os dados cai em 1d20 +0', () => {
        expect(playerInitiativeDice({})).toEqual({ numDice: 1, expertiseValue: 0 })
        expect(playerInitiativeDice(null)).toEqual({ numDice: 1, expertiseValue: 0 })
        expect(playerInitiativeDice({ expertises: { Agilidade: { value: 'x' } }, mods: { attributes: { des: 'y' } } })).toEqual({ numDice: 1, expertiseValue: 0 })
    })
})

describe('creatureInitiativeDice', () => {
    it('⌊atributo ÷ 5⌋ d20, de 1 a 5', () => {
        const at = (des: number) => creatureInitiativeDice({ expertises: { Agilidade: { value: 2, defaultAttribute: 'des' } }, attributes: { des } })
        expect(at(0)).toEqual({ numDice: 1, expertiseValue: 2 })
        expect(at(4)).toEqual({ numDice: 1, expertiseValue: 2 })
        expect(at(10)).toEqual({ numDice: 2, expertiseValue: 2 })
        expect(at(15)).toEqual({ numDice: 3, expertiseValue: 2 })
        expect(at(99)).toEqual({ numDice: 5, expertiseValue: 2 })
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
