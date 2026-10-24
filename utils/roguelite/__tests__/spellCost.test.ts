import { calculateExtraManaCost, calculateTotalManaCost } from '../spellCost';

describe('acréscimo de MP por estágio: padrão do código', () => {
    it.each([
        [ 1, [ 0, 1, 2 ] ],
        [ 2, [ 0, 2, 4 ] ],
        [ 3, [ 0, 2, 5 ] ],
        [ 4, [ 0, 4, 9 ] ]
    ])('nível %i: estágios 1, 2 e 3', (level, expected) => {
        expect([ 0, 1, 2 ].map(stage => calculateExtraManaCost(level, stage))).toEqual(expected);
    });

    it('sem o campo (ausente, null ou lista vazia) vale o padrão', () => {
        expect(calculateExtraManaCost(2, 2)).toBe(4);
        expect(calculateExtraManaCost(2, 2, undefined)).toBe(4);
        expect(calculateExtraManaCost(2, 2, null)).toBe(4);
        expect(calculateExtraManaCost(2, 2, [])).toBe(4);
    });
});

describe('acréscimo de MP por estágio: campo mpCostIncrease da magia', () => {
    it('os números valem para o estágio 2 e o estágio 3, nessa ordem, no lugar do padrão', () => {
        expect(calculateExtraManaCost(1, 1, [ 3, 7 ])).toBe(3);
        expect(calculateExtraManaCost(1, 2, [ 3, 7 ])).toBe(7);
        expect(calculateTotalManaCost(5, 1, 0, [ 3, 7 ])).toBe(5);
        expect(calculateTotalManaCost(5, 1, 1, [ 3, 7 ])).toBe(8);
        expect(calculateTotalManaCost(5, 1, 2, [ 3, 7 ])).toBe(12);
    });

    it('o estágio 1 nunca tem acréscimo, mesmo com o campo', () => {
        expect(calculateExtraManaCost(4, 0, [ 9, 9 ])).toBe(0);
    });

    it('magia de 2 estágios (um número): o estágio 3 que faltar cai no padrão do nível', () => {
        expect(calculateExtraManaCost(3, 1, [ 6 ])).toBe(6);
        expect(calculateExtraManaCost(3, 2, [ 6 ])).toBe(5);
    });

    it('zero é um acréscimo válido (estágio sem custo extra)', () => {
        expect(calculateExtraManaCost(4, 1, [ 0, 0 ])).toBe(0);
        expect(calculateExtraManaCost(4, 2, [ 0, 0 ])).toBe(0);
    });

    it('número ausente, vazio ou inválido volta ao padrão só daquele estágio', () => {
        expect(calculateExtraManaCost(2, 1, [ null, 8 ])).toBe(2);
        expect(calculateExtraManaCost(2, 2, [ null, 8 ])).toBe(8);
        expect(calculateExtraManaCost(2, 1, [ 'abc', 8 ])).toBe(2);
        expect(calculateExtraManaCost(2, 2, [ 3, '' ])).toBe(4);
    });

    it('aceita número guardado como texto, arredonda e não deixa ficar negativo', () => {
        expect(calculateExtraManaCost(1, 1, [ '5', '2' ])).toBe(5);
        expect(calculateExtraManaCost(1, 1, [ 2.6, 1 ])).toBe(3);
        expect(calculateExtraManaCost(1, 1, [ -4, 1 ])).toBe(0);
    });

    it('campo que não é lista é ignorado', () => {
        expect(calculateExtraManaCost(2, 1, { 0: 9 } as never)).toBe(2);
        expect(calculateExtraManaCost(2, 1, 9 as never)).toBe(2);
    });
});
