import { spellCastDifficulty, spellCastSucceeded } from '../spellDifficulty';

describe('spellCastDifficulty (DT do teste de magia)', () => {
    it.each([
        [ 1, [ 15, 17, 20 ] ],
        [ 2, [ 18, 21, 23 ] ],
        [ 3, [ 22, 24, 26 ] ],
        [ 4, [ 26, 28, 30 ] ]
    ])('nível %i: DT dos estágios 1, 2 e 3', (level, expected) => {
        expect([ 1, 2, 3 ].map(stage => spellCastDifficulty(level, stage))).toEqual(expected);
    });

    it('aceita o nível como texto (o catálogo antigo guarda string)', () => {
        expect(spellCastDifficulty('3', 2)).toBe(24);
    });

    it('nível ou estágio fora da tabela não tem DT', () => {
        expect(spellCastDifficulty(5, 1)).toBeNull();
        expect(spellCastDifficulty(0, 1)).toBeNull();
        expect(spellCastDifficulty(undefined, 1)).toBeNull();
        expect(spellCastDifficulty(2, 4)).toBeNull();
        expect(spellCastDifficulty(2, 0)).toBeNull();
    });
});

describe('spellCastSucceeded', () => {
    it('total igual ou maior que a DT passa; menor falha', () => {
        expect(spellCastSucceeded(18, 18)).toBe(true);
        expect(spellCastSucceeded(30, 18)).toBe(true);
        expect(spellCastSucceeded(17, 18)).toBe(false);
    });

    it('sem DT na tabela a conjuração vale', () => {
        expect(spellCastSucceeded(1, null)).toBe(true);
    });
});
