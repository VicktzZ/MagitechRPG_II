import { creatureD20Pool, creatureModifier, d20Pool, describeD20Pool, MAX_D20_DICE, SINGLE_D20 } from '../d20Rule';

describe('regra única de d20 (utils/d20Rule.ts)', () => {
    it('modificador do atributo + 1 d20, vale o maior', () => {
        expect(d20Pool(0)).toEqual({ dice: 1, keep: 'highest' });
        expect(d20Pool(1)).toEqual({ dice: 2, keep: 'highest' });
        expect(d20Pool(3)).toEqual({ dice: 4, keep: 'highest' });
        expect(d20Pool(5)).toEqual({ dice: 6, keep: 'highest' });
    });

    it('modificador negativo rola 2 d20 e vale o menor, seja qual for o tamanho do negativo', () => {
        expect(d20Pool(-1)).toEqual({ dice: 2, keep: 'lowest' });
        expect(d20Pool(-4)).toEqual({ dice: 2, keep: 'lowest' });
    });

    it('modificador que não é número vale o d20 puro; texto numérico e fração são lidos', () => {
        for (const value of [ undefined, null, NaN, 'abc', {} ]) expect(d20Pool(value)).toEqual(SINGLE_D20);
        expect(d20Pool('2')).toEqual({ dice: 3, keep: 'highest' });
        expect(d20Pool(2.9)).toEqual({ dice: 3, keep: 'highest' });
        expect(d20Pool(-0.5)).toEqual({ dice: 2, keep: 'lowest' });
    });

    it('o teto de dados é o de sempre (sistemas customizados vão além do 6 da regra padrão)', () => {
        expect(d20Pool(500).dice).toBe(MAX_D20_DICE);
    });

    it('o d20 puro não é alterado por quem o usa (cada chamada devolve um objeto novo)', () => {
        const pool = d20Pool(undefined);
        pool.dice = 9;
        expect(SINGLE_D20.dice).toBe(1);
        expect(d20Pool(undefined).dice).toBe(1);
    });
});

describe('modificador da criatura', () => {
    it('0 vale −1, depois ⌊valor ÷ 5⌋ até 5', () => {
        expect(creatureModifier(0)).toBe(-1);
        expect(creatureModifier(4)).toBe(0);
        expect(creatureModifier(5)).toBe(1);
        expect(creatureModifier(14)).toBe(2);
        expect(creatureModifier(30)).toBe(5);
        expect(creatureModifier(99)).toBe(5);
    });

    it('atributo ausente ou ilegível vale 0, ou seja, −1', () => {
        expect(creatureModifier(undefined)).toBe(-1);
        expect(creatureModifier('x')).toBe(-1);
    });

    it('os d20 da criatura seguem a mesma regra: atributo 5 rola 2, atributo 0 rola 2 e vale o menor', () => {
        expect(creatureD20Pool(4)).toEqual({ dice: 1, keep: 'highest' });
        expect(creatureD20Pool(5)).toEqual({ dice: 2, keep: 'highest' });
        expect(creatureD20Pool(20)).toEqual({ dice: 5, keep: 'highest' });
        expect(creatureD20Pool(0)).toEqual({ dice: 2, keep: 'lowest' });
    });
});

describe('texto', () => {
    it('diz a regra para dicas e logs', () => {
        expect(describeD20Pool({ dice: 1, keep: 'highest' })).toBe('1d20');
        expect(describeD20Pool({ dice: 4, keep: 'highest' })).toBe('4d20 (vale o maior)');
        expect(describeD20Pool({ dice: 2, keep: 'lowest' })).toBe('2d20 (vale o menor)');
    });
});
