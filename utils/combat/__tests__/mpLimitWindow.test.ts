import type { Combatant } from '@models';
import { resetMpLimitWindows } from '../mpLimitWindow';

const combatant = (patch: Partial<Combatant>): Combatant => ({ id: 'x', name: 'X', type: 'player', ...patch }) as Combatant;

describe('resetMpLimitWindows (a rodada virou)', () => {
    it('zera o MP gasto e a liberação do limite de todos os presentes no combate', () => {
        const combatants = [
            combatant({ id: 'a', mpSpentThisTurn: 8, mpLimitOverride: true }),
            combatant({ id: 'b', mpSpentThisTurn: 3, mpLimitOverride: false }),
            combatant({ id: 'g', type: 'creature', mpSpentThisTurn: undefined })
        ];

        resetMpLimitWindows(combatants);

        expect(combatants.map(c => [ c.mpSpentThisTurn, c.mpLimitOverride ])).toEqual([ [ 0, false ], [ 0, false ], [ 0, false ] ]);
    });

    it('não falha sem combatentes', () => {
        expect(() => { resetMpLimitWindows(undefined); }).not.toThrow();
        expect(() => { resetMpLimitWindows([]); }).not.toThrow();
    });
});
