import type { Combatant, Creature } from '@models';
import { applyCombatantDeltas, combatantVitals } from '../combatantVitals';

const combatant = (overrides: Record<string, unknown> = {}): Combatant => ({
    id: 'goblin-1', name: 'Goblin A', type: 'creature', currentLp: 9, maxLp: 20, currentMp: 2, maxMp: 6, effects: [], hasActed: true, ...overrides
}) as unknown as Combatant;

const creature = { id: 'goblin', stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 8 } } as unknown as Creature;

describe('combatantVitals', () => {
    it('usa o que o combatente guarda (é onde o combate registra o que mudou)', () => {
        expect(combatantVitals(combatant(), creature)).toEqual({ lp: 9, maxLp: 20, mp: 2, maxMp: 6 });
    });

    it('o que o combatente não guarda vem da criatura de origem', () => {
        const entered = combatant({ currentMp: undefined, maxMp: undefined });
        expect(combatantVitals(entered, creature)).toEqual({ lp: 9, maxLp: 20, mp: 4, maxMp: 8 });
        expect(combatantVitals(combatant({ currentLp: undefined, maxLp: undefined }), creature)).toMatchObject({ lp: 20, maxLp: 25 });
    });

    it('máximo que falta vale o atual da criatura; sem criatura e sem nada, zero', () => {
        expect(combatantVitals(combatant({ maxLp: undefined }), { stats: { lp: 12 } })).toMatchObject({ lp: 9, maxLp: 12 });
        expect(combatantVitals({}, null)).toEqual({ lp: 0, maxLp: 0, mp: 0, maxMp: 0 });
        expect(combatantVitals({}, undefined)).toEqual({ lp: 0, maxLp: 0, mp: 0, maxMp: 0 });
    });

    it('lixo no lugar de número não vira NaN', () => {
        const messy = combatant({ currentLp: 'abc', maxLp: null, currentMp: NaN, maxMp: '' });
        expect(combatantVitals(messy, creature)).toEqual({ lp: 20, maxLp: 25, mp: 4, maxMp: 8 });
        expect(JSON.stringify(combatantVitals(messy, null))).not.toContain('null');
    });

    it('números guardados como texto valem', () => {
        expect(combatantVitals(combatant({ currentLp: '7', maxLp: '30' }), creature)).toMatchObject({ lp: 7, maxLp: 30 });
    });
});

describe('applyCombatantDeltas', () => {
    it('dano para em zero e cura para no máximo', () => {
        expect(applyCombatantDeltas(combatant(), creature, { lp: -50 }).combatant.currentLp).toBe(0);
        expect(applyCombatantDeltas(combatant(), creature, { lp: 50 }).combatant.currentLp).toBe(20);
        expect(applyCombatantDeltas(combatant(), creature, { mp: 50 }).combatant.currentMp).toBe(6);
        expect(applyCombatantDeltas(combatant({ currentMp: 1 }), creature, { mp: -4 }).combatant.currentMp).toBe(0);
    });

    it('devolve o que mudou, antes e depois, só dos pontos ajustados', () => {
        const { changes } = applyCombatantDeltas(combatant(), creature, { lp: -4 });
        expect(changes).toEqual({ lp: { before: 9, after: 5 } });
        expect(applyCombatantDeltas(combatant(), creature, { lp: 3, mp: -1 }).changes).toEqual({ lp: { before: 9, after: 12 }, mp: { before: 2, after: 1 } });
    });

    it('não mexe no original nem no que não foi ajustado', () => {
        const original = combatant();
        const { combatant: next } = applyCombatantDeltas(original, creature, { lp: -4 });

        expect(original.currentLp).toBe(9);
        expect(next).not.toBe(original);
        expect(next).toMatchObject({ id: 'goblin-1', name: 'Goblin A', hasActed: true, currentMp: 2, maxMp: 6, effects: [] });
        expect(next.currentLp).toBe(5);
    });

    it('quem está acima do máximo não perde nada ao ser curado, e dano ainda desce a partir do valor real', () => {
        const over = combatant({ currentLp: 30, maxLp: 20 });
        expect(applyCombatantDeltas(over, creature, { lp: 5 }).combatant.currentLp).toBe(30);
        expect(applyCombatantDeltas(over, creature, { lp: -5 }).combatant.currentLp).toBe(25);
    });

    it('grava o valor de origem junto: criatura que entrou sem mana passa a ter atual e máximo no combatente', () => {
        const entered = combatant({ currentMp: undefined, maxMp: undefined });
        const { combatant: next, changes } = applyCombatantDeltas(entered, creature, { mp: -1 });

        expect(changes.mp).toEqual({ before: 4, after: 3 });
        expect(next).toMatchObject({ currentMp: 3, maxMp: 8 });
    });

    it('sem criatura de origem usa só o combatente', () => {
        const { combatant: next } = applyCombatantDeltas(combatant(), null, { lp: 100 });
        expect(next.currentLp).toBe(20);
    });
});
