import { ApiError } from '../errors';
import { assertCombatantVitalsBody } from '../combatantStats';
import { assertVitalDeltas } from '../charsheetStats';

const fails = (body: unknown): ApiError => {
    try {
        assertCombatantVitalsBody(body);
    } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        return error as ApiError;
    }
    throw new Error('devia ter lançado');
};

describe('assertCombatantVitalsBody', () => {
    it('aceita o combatente e uma ou duas variações inteiras', () => {
        expect(assertCombatantVitalsBody({ combatantId: 'goblin-1', lp: -5 })).toEqual({ combatantId: 'goblin-1', deltas: { lp: -5 } });
        expect(assertCombatantVitalsBody({ combatantId: 'goblin-1', lp: -5, mp: 3 })).toEqual({ combatantId: 'goblin-1', deltas: { lp: -5, mp: 3 } });
    });

    it('descarta variação zero, mas recusa se não sobrar nada', () => {
        expect(assertCombatantVitalsBody({ combatantId: 'a', lp: 0, mp: 2 }).deltas).toEqual({ mp: 2 });
        expect(fails({ combatantId: 'a', lp: 0 }).status).toBe(400);
        expect(fails({ combatantId: 'a' }).status).toBe(400);
    });

    it('exige um id de combatente válido (sem caminho, ponto, vazio nem não texto)', () => {
        [ undefined, null, '', 'a/b', '..', 'a b', 5, [ 'a' ], 'x'.repeat(200) ].forEach(id => {
            expect(fails({ combatantId: id, lp: -1 }).status).toBe(400);
        });
        expect(assertCombatantVitalsBody({ combatantId: '4f6c-aa10_9b2e-3', lp: 1 }).combatantId).toBe('4f6c-aa10_9b2e-3');
    });

    it('a criatura não tem armadura própria: ap é campo desconhecido, como qualquer outro', () => {
        expect(fails({ combatantId: 'a', ap: -1 }).message).toContain('ap');
        expect(fails({ combatantId: 'a', lp: -1, maxLp: 99 }).message).toContain('maxLp');
        expect(fails({ combatantId: 'a', lp: -1, session: {} }).status).toBe(400);
    });

    it('recusa o que não é objeto', () => {
        [ null, undefined, 'lp', 5, [ 1, 2 ], true ].forEach(body => expect(fails(body).status).toBe(400));
    });

    it('recusa decimal, texto, nulo, infinito e acima do limite; aceita os extremos', () => {
        [ 1.5, '3', null, NaN, Infinity, 10000, -10000, true, {} ].forEach(value => {
            expect(fails({ combatantId: 'a', lp: value }).status).toBe(400);
        });
        expect(assertCombatantVitalsBody({ combatantId: 'a', lp: 9999, mp: -9999 }).deltas).toEqual({ lp: 9999, mp: -9999 });
    });
});

describe('assertVitalDeltas (rota da ficha, sem mudança)', () => {
    it('continua aceitando lp, mp e ap e recusando combatantId', () => {
        expect(assertVitalDeltas({ lp: -1, mp: 2, ap: 3 })).toEqual({ lp: -1, mp: 2, ap: 3 });
        expect(() => assertVitalDeltas({ lp: -1, combatantId: 'a' })).toThrow(ApiError);
    });
});
