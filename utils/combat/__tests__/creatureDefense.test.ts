import { computeDamage } from '../engine/damage';
import { weaknessAgainst } from '../engine/weakness';
import {
    creatureTakenModifiers,
    creatureWeaknessProfile,
    describeDamageModifier,
    hasDeclaredDefenses,
    MAX_DEFENSE_ENTRIES,
    sanitizeDamageModifiers,
    sanitizeWeaknesses
} from '../creatureDefense';

describe('sanitizeWeaknesses', () => {
    it('mantém os nomes, tira vazios e repetidos (sem caixa nem acento)', () => {
        expect(sanitizeWeaknesses([ 'Fogo', ' fogo ', 'Cortante', '', 42, null, 'ÁGUA', 'agua' ])).toEqual([ 'Fogo', 'Cortante', 'ÁGUA' ]);
    });

    it('lixo vira lista vazia e o tamanho é limitado', () => {
        expect(sanitizeWeaknesses(undefined)).toEqual([]);
        expect(sanitizeWeaknesses('Fogo')).toEqual([]);
        expect(sanitizeWeaknesses(Array.from({ length: 50 }, (_, index) => `Tipo ${index}`))).toHaveLength(MAX_DEFENSE_ENTRIES);
        expect(sanitizeWeaknesses([ 'x'.repeat(100) ])[0]).toHaveLength(40);
    });
});

describe('sanitizeDamageModifiers', () => {
    it('aceita resistência e vulnerabilidade, percentual ou fixo, com ou sem elemento', () => {
        expect(sanitizeDamageModifiers([
            { kind: 'resistance', element: 'Fogo', value: '25%' },
            { kind: 'vulnerability', value: '3' },
            { kind: 'resistance', element: 'Físico', value: 2 }
        ])).toEqual([
            { kind: 'resistance', element: 'Fogo', value: '25%' },
            { kind: 'vulnerability', value: '3' },
            { kind: 'resistance', element: 'Físico', value: '2' }
        ]);
    });

    it('o sinal escrito não manda: o kind dá o sinal', () => {
        expect(sanitizeDamageModifiers([ { kind: 'resistance', value: '-25%' }, { kind: 'vulnerability', value: '+10%' } ])).toEqual([
            { kind: 'resistance', value: '25%' },
            { kind: 'vulnerability', value: '10%' }
        ]);
    });

    it.each([
        [ 'kind desconhecido', { kind: 'imune', value: '25%' } ],
        [ 'valor não numérico', { kind: 'resistance', value: 'muito' } ],
        [ 'valor zero', { kind: 'resistance', value: '0%' } ],
        [ 'sem valor', { kind: 'resistance' } ],
        [ 'não é objeto', 'resistance' ]
    ])('descarta entrada com %s', (_nome, entry) => {
        expect(sanitizeDamageModifiers([ entry ])).toEqual([]);
    });

    it('lixo vira lista vazia e o tamanho é limitado', () => {
        expect(sanitizeDamageModifiers(undefined)).toEqual([]);
        expect(sanitizeDamageModifiers({})).toEqual([]);
        expect(sanitizeDamageModifiers(Array.from({ length: 50 }, () => ({ kind: 'resistance', value: '5%' })))).toHaveLength(MAX_DEFENSE_ENTRIES);
    });
});

describe('ligação com o motor', () => {
    it('o perfil de fraqueza soma as declaradas e a do elemento da criatura', () => {
        const creature = { elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ] };

        expect(weaknessAgainst(creatureWeaknessProfile(creature), 'Água')).toMatchObject({ weak: true, damageMultiplier: 2 }); // Água vence Fogo
        expect(weaknessAgainst(creatureWeaknessProfile(creature), 'Cortante')).toMatchObject({ weak: true });
        expect(weaknessAgainst(creatureWeaknessProfile(creature), 'Terra')).toMatchObject({ weak: false });
    });

    it('criatura sem defesas não é fraca a nada', () => {
        expect(weaknessAgainst(creatureWeaknessProfile({}), 'Fogo').weak).toBe(false);
        expect(weaknessAgainst(creatureWeaknessProfile(null), 'Fogo').weak).toBe(false);
    });

    it('as resistências chegam ao cálculo do dano no formato do motor', () => {
        const creature = { damageModifiers: [ { kind: 'resistance', element: 'Fogo', value: '50%' }, { kind: 'vulnerability', element: 'Físico', value: '2' } ] };
        const taken = creatureTakenModifiers(creature);

        expect(taken).toEqual([
            { kind: 'resistance', pct: -50, flat: 0, element: 'fogo' },
            { kind: 'vulnerability', pct: 0, flat: 2, element: 'fisico' }
        ]);

        const fire = computeDamage({ rolled: 10, kind: 'magico', attackType: 'Fogo', defense: 'none', targetAp: 0, resistanceMod: 0, taken });
        expect(fire.final).toBe(5);
        const sword = computeDamage({ rolled: 10, kind: 'fisico', attackType: 'Cortante', defense: 'none', targetAp: 0, resistanceMod: 0, taken });
        expect(sword.final).toBe(12);
    });
});

describe('textos e checagem', () => {
    it('descreve a resistência e a vulnerabilidade', () => {
        expect(describeDamageModifier({ kind: 'resistance', element: 'Fogo', value: '25%' })).toBe('Resistência a Fogo: 25%');
        expect(describeDamageModifier({ kind: 'vulnerability', value: '3' })).toBe('Vulnerabilidade a todo dano: 3');
    });

    it('sabe se há alguma defesa declarada', () => {
        expect(hasDeclaredDefenses({})).toBe(false);
        expect(hasDeclaredDefenses({ elementalMastery: '' })).toBe(false);
        expect(hasDeclaredDefenses({ elementalMastery: 'Fogo' })).toBe(true);
        expect(hasDeclaredDefenses({ weaknesses: [ 'Cortante' ] })).toBe(true);
        expect(hasDeclaredDefenses({ damageModifiers: [ { kind: 'resistance', value: '10%' } ] })).toBe(true);
        expect(hasDeclaredDefenses({ damageModifiers: [ { kind: 'resistance', value: 'x' } ] })).toBe(false);
    });
});
