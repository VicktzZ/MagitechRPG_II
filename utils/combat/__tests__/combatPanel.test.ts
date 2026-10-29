import type { Combatant, Creature } from '@models';
import { combatAttention, combatantVitalsView, describeAttention, mpLimitView, pendingInitiative } from '../combatPanel';

const combatant = (patch: Partial<Combatant> = {}): Combatant => ({
    id: 'c1', name: 'Aria', type: 'player', initiativeRoll: 12, initiativeBonus: 0, initiativeTotal: 12, hasActed: false, ...patch
} as Combatant);

const creature = (patch: Record<string, unknown> = {}): Creature => ({
    id: 'goblin', name: 'Goblin', level: 3, attributes: { foc: 4 }, stats: { lp: 20, maxLp: 20, mp: 8, maxMp: 8, ap: 12 }, ...patch
} as unknown as Creature);

describe('combatAttention', () => {
    it('conta o que espera o mestre e soma o total', () => {
        const attention = combatAttention({ pendingAttacks: [ {}, {} ], opportunities: [ {} ], reactions: [ {}, {}, {} ] });
        expect(attention).toEqual({ attacks: 2, opportunities: 1, reactions: 3, total: 6 });
    });

    it('combate antigo, sem as listas, não espera nada', () => {
        expect(combatAttention({})).toEqual({ attacks: 0, opportunities: 0, reactions: 0, total: 0 });
        expect(combatAttention(null)).toEqual({ attacks: 0, opportunities: 0, reactions: 0, total: 0 });
        expect(combatAttention({ pendingAttacks: undefined, reactions: null }).total).toBe(0);
    });
});

describe('describeAttention', () => {
    it('diz cada coisa no singular ou no plural e separa por ponto', () => {
        expect(describeAttention({ attacks: 1, opportunities: 0, reactions: 0, total: 1 })).toBe('1 ataque esperando você');
        expect(describeAttention({ attacks: 2, opportunities: 1, reactions: 2, total: 5 }))
            .toBe('2 ataques esperando você · 1 saída de alcance aberta · 2 ofertas de reação abertas');
    });

    it('sem nada esperando a frase é vazia', () => {
        expect(describeAttention({ attacks: 0, opportunities: 0, reactions: 0, total: 0 })).toBe('');
    });
});

describe('combatantVitalsView', () => {
    it('jogador: vale a ficha, não a cópia velha do combatente', () => {
        const vitals = combatantVitalsView(
            combatant({ currentLp: 40, maxLp: 45, currentMp: 30, maxMp: 30 }),
            { charsheets: [ { id: 'c1', stats: { lp: 12, maxLp: 45, mp: 5, maxMp: 30 } } ], creatures: [] }
        );
        expect(vitals).toEqual({ lp: 12, maxLp: 45, mp: 5, maxMp: 30 });
    });

    it('jogador sem a ficha carregada: vale a cópia do combatente', () => {
        const vitals = combatantVitalsView(combatant({ currentLp: 40, maxLp: 45, currentMp: 30, maxMp: 30 }), { charsheets: [], creatures: [] });
        expect(vitals).toEqual({ lp: 40, maxLp: 45, mp: 30, maxMp: 30 });
    });

    it('a ficha é achada também pelo odacId do combatente', () => {
        const vitals = combatantVitalsView(combatant({ id: 'x', odacId: 'sheet-9' }), { charsheets: [ { id: 'sheet-9', stats: { lp: 7, maxLp: 9, mp: 1, maxMp: 2 } } ], creatures: [] });
        expect(vitals.lp).toBe(7);
    });

    it('criatura: o que o combatente guarda e, no que falta, a criatura de origem (cópia com sufixo)', () => {
        const copy = combatant({ id: 'goblin-2', type: 'creature', currentLp: 9, maxLp: undefined, currentMp: undefined, maxMp: undefined });
        const vitals = combatantVitalsView(copy, { charsheets: [], creatures: [ creature() ] });
        expect(vitals).toEqual({ lp: 9, maxLp: 20, mp: 8, maxMp: 8 });
    });
});

describe('mpLimitView', () => {
    const sheet = { id: 'c1', level: 5, ORMLevel: 0, attributes: { foc: 5 }, systemId: null, stats: undefined };

    it('jogador de ficha comum: limite ⌈(nível + Foco) ÷ 2⌉, gasto e liberação do combatente', () => {
        const view = mpLimitView(combatant({ mpSpentThisTurn: 4, mpLimitOverride: true }), { charsheets: [ sheet ], creatures: [], mode: 'classic' });
        expect(view).toEqual({ enforced: true, limit: 5, spent: 4, released: true });
    });

    it('o Roguelite não tem limite', () => {
        expect(mpLimitView(combatant(), { charsheets: [ sheet ], creatures: [], mode: 'Roguelite' }).enforced).toBe(false);
    });

    it('criatura: o limite vem da criatura de origem (nível e Foco, sem ORM)', () => {
        const view = mpLimitView(combatant({ id: 'goblin-1', type: 'creature', mpSpentThisTurn: 2 }), { charsheets: [], creatures: [ creature() ], mode: 'classic' });
        expect(view).toEqual({ enforced: true, limit: 4, spent: 2, released: false });
    });

    it('combatente sem ficha nem criatura de origem: a regra não vale', () => {
        expect(mpLimitView(combatant({ id: 'ghost' }), { charsheets: [], creatures: [], mode: 'classic' })).toEqual({ enforced: false, limit: 0, spent: 0, released: false });
    });
});

describe('pendingInitiative', () => {
    it('conta quem ainda não rolou', () => {
        expect(pendingInitiative([ { initiativeRoll: 0 }, { initiativeRoll: 14 }, { initiativeRoll: 0 } ])).toBe(2);
        expect(pendingInitiative(undefined)).toBe(0);
    });
});
