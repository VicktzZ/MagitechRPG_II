import { elementBeating, weaknessAgainst, weaknessesOf } from '../weakness';

describe('ciclo elemental (regras do dono)', () => {
    it('Água vence Fogo, que vence Terra, que vence Ar, que vence Eletricidade, que vence Água', () => {
        // elementBeating(X) é quem vence X, ou seja, a fraqueza de X
        expect(elementBeating('Fogo')).toBe('agua');
        expect(elementBeating('Terra')).toBe('fogo');
        expect(elementBeating('Ar')).toBe('terra');
        expect(elementBeating('Eletricidade')).toBe('ar');
        expect(elementBeating('Água')).toBe('eletricidade');
    });

    it('Trevas e Luz vencem uma à outra', () => {
        expect(elementBeating('Trevas')).toBe('luz');
        expect(elementBeating('Luz')).toBe('trevas');
    });

    it('secundários, Não-elemental e físicos ficam fora do ciclo', () => {
        for (const element of [ 'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão', 'Não-elemental', 'Cortante', '', undefined ]) {
            expect(elementBeating(element)).toBeNull();
        }
    });

    it('ignora caixa e acento do banco', () => {
        expect(elementBeating('FOGO')).toBe('agua');
        expect(elementBeating('ÁGUA')).toBe('eletricidade');
    });
});

describe('fraqueza do alvo', () => {
    it('Água atacando uma criatura de Fogo: +1d20 e dano ×2', () => {
        expect(weaknessAgainst({ element: 'FOGO' }, 'Água')).toEqual({ weak: true, advantages: 1, damageMultiplier: 2 });
    });

    it('elemento errado não dá nada', () => {
        expect(weaknessAgainst({ element: 'FOGO' }, 'Terra')).toEqual({ weak: false, advantages: 0, damageMultiplier: 1 });
        expect(weaknessAgainst({}, 'Água').weak).toBe(false);
        expect(weaknessAgainst({ element: 'FOGO' }, undefined).weak).toBe(false);
    });

    it('a maestria dá fraqueza ao elemento que vence o dela, e o atacante não precisa de maestria', () => {
        // maestria em Fogo => fraco a Água
        expect(weaknessesOf({ mastery: 'Fogo' })).toEqual([ 'agua' ]);
        expect(weaknessAgainst({ mastery: 'Fogo' }, 'Água').weak).toBe(true);
        expect(weaknessAgainst({ mastery: 'Fogo' }, 'Terra').weak).toBe(false);
    });

    it('maestria secundária não cria fraqueza pelo ciclo', () => {
        expect(weaknessesOf({ mastery: 'Sangue', element: 'Psíquico' })).toEqual([]);
    });

    it('fraquezas declaradas valem, inclusive tipos físicos e secundários', () => {
        expect(weaknessAgainst({ weaknesses: [ 'Cortante' ] }, 'cortante').weak).toBe(true);
        expect(weaknessAgainst({ weaknesses: [ 'Impactante' ] }, 'Cortante').weak).toBe(false);
        expect(weaknessAgainst({ weaknesses: [ 'Sangue' ] }, 'Sangue').weak).toBe(true);
    });

    it('junta as fraquezas sem repetir', () => {
        expect(weaknessesOf({ element: 'Fogo', mastery: 'Fogo', weaknesses: [ 'Água', 'Cortante' ] }).sort()).toEqual([ 'agua', 'cortante' ]);
    });
});
