import {
    calculateBaseMpLimit,
    evaluateMpSpend,
    getMpLimit,
    isMpLimitEnforced
} from '../mpLimit'

describe('calculateBaseMpLimit — ⌈(Nível + Foco) ÷ 2⌉ + ORM', () => {
    // [descrição, nível, ORM, foco, limite esperado]
    const examples: Array<[string, number, number, number, number]> = [
        [ 'Arcano nível 1', 1, 1, 12, 8 ],
        [ 'Combatente nível 1', 1, 1, 4, 4 ],
        [ 'Feiticeiro nível 5', 5, 2, 18, 14 ],
        [ 'Bruxo nível 10', 10, 3, 24, 20 ],
        [ 'Arcano nível 15', 15, 4, 30, 27 ],
        [ 'Arcano nível 20', 20, 4, 30, 29 ],
        [ 'Combatente nível 20', 20, 4, 10, 19 ]
    ]

    it.each(examples)('%s', (_name, level, orm, foc, expected) => {
        expect(calculateBaseMpLimit(level, foc, orm)).toBe(expected)
    })

    it('arredonda para cima quando Nível + Foco é ímpar', () => {
        expect(calculateBaseMpLimit(1, 4, 1)).toBe(4)
        expect(calculateBaseMpLimit(2, 4, 1)).toBe(4)
    })

    it('uma Maestria típica (~21 MP) exige Foco ≥ 18 no nível 15 e ≥ 13 no nível 20', () => {
        expect(calculateBaseMpLimit(15, 17, 4)).toBe(20)
        expect(calculateBaseMpLimit(15, 18, 4)).toBe(21)
        expect(calculateBaseMpLimit(20, 12, 4)).toBe(20)
        expect(calculateBaseMpLimit(20, 13, 4)).toBe(21)
    })

    it('trata valores ausentes, negativos ou inválidos como zero', () => {
        expect(calculateBaseMpLimit(undefined, null, undefined)).toBe(0)
        expect(calculateBaseMpLimit(-5, -5, -1)).toBe(0)
        expect(calculateBaseMpLimit('abc', NaN, 'x')).toBe(0)
    })
})

describe('getMpLimit — soma o bônus de perks/mestre', () => {
    it('base + bônus', () => {
        expect(getMpLimit({ level: 10, ORMLevel: 3, attributes: { foc: 24 }, mpLimit: 0 })).toBe(20)
        expect(getMpLimit({ level: 10, ORMLevel: 3, attributes: { foc: 24 }, mpLimit: 3 })).toBe(23)
    })

    it('bônus negativo ou ausente não reduz o limite', () => {
        expect(getMpLimit({ level: 10, ORMLevel: 3, attributes: { foc: 24 }, mpLimit: -5 })).toBe(20)
        expect(getMpLimit({ level: 10, ORMLevel: 3, attributes: { foc: 24 } })).toBe(20)
    })
})

describe('isMpLimitEnforced', () => {
    const sheet = { level: 5, ORMLevel: 2, attributes: { foc: 10 } }

    it('vale para fichas Classic comuns', () => {
        expect(isMpLimitEnforced(sheet, 'Classic')).toBe(true)
        expect(isMpLimitEnforced(sheet)).toBe(true)
    })

    it('não vale no Roguelite', () => {
        expect(isMpLimitEnforced(sheet, 'Roguelite')).toBe(false)
    })

    it('não vale em sistemas customizados', () => {
        expect(isMpLimitEnforced({ ...sheet, systemId: 'sys-1' }, 'Classic')).toBe(false)
    })

    it('não vale em fichas sem nível/ORM/Foco (cálculo daria 0)', () => {
        expect(isMpLimitEnforced({ level: 0, ORMLevel: 0, attributes: { foc: 0 } }, 'Classic')).toBe(false)
    })
})

describe('evaluateMpSpend', () => {
    const base = { limit: 14, enforced: true }

    it('permite o gasto que cabe no limite', () => {
        expect(evaluateMpSpend({ ...base, spent: 0, amount: 14 })).toEqual({ allowed: true, spent: 14 })
        expect(evaluateMpSpend({ ...base, spent: 8, amount: 6 })).toEqual({ allowed: true, spent: 14 })
    })

    it('bloqueia o gasto que ultrapassa o limite e não altera o contador', () => {
        const result = evaluateMpSpend({ ...base, spent: 8, amount: 7 })
        expect(result.allowed).toBe(false)
        if (!result.allowed) {
            expect(result.spent).toBe(8)
            expect(result.limit).toBe(14)
            expect(result.message).toContain('8 de 14')
            expect(result.message).toContain('restam 6')
        }
    })

    it('a liberação do mestre ignora o limite, mas continua contando o gasto', () => {
        expect(evaluateMpSpend({ ...base, spent: 14, amount: 5, override: true })).toEqual({ allowed: true, spent: 19 })
    })

    it('sem limite aplicável, só contabiliza', () => {
        expect(evaluateMpSpend({ limit: 4, enforced: false, spent: 10, amount: 30 })).toEqual({ allowed: true, spent: 40 })
    })

    it('valor negativo estorna sem passar de 0', () => {
        expect(evaluateMpSpend({ ...base, spent: 10, amount: -4 })).toEqual({ allowed: true, spent: 6 })
        expect(evaluateMpSpend({ ...base, spent: 3, amount: -9 })).toEqual({ allowed: true, spent: 0 })
    })

    it('recuperar MP não devolve limite: o contador só considera o gasto bruto', () => {
        // gasta 8, recupera 3 (MP sobe, contador não muda), gasta 7 → 15 > 14 bloqueia
        const first = evaluateMpSpend({ ...base, spent: 0, amount: 8 })
        expect(first).toEqual({ allowed: true, spent: 8 })
        const second = evaluateMpSpend({ ...base, spent: 8, amount: 7 })
        expect(second.allowed).toBe(false)
    })
})
