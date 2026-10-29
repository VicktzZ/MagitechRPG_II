import type { AppliedEffect, Combat } from '@models';
import { adjustDice, combatantEffects, effectDice, expertiseScope, keptDie } from '../effectDice';

const effect = (name: string, modifiers: Array<Record<string, unknown>>, effectId = `seed-${name.toLowerCase()}`): AppliedEffect => ({
    id: `e-${name}`, effectId, level: 1, remaining: 3, snapshot: { name, levels: [ { level: 1, modifiers } ] }
}) as unknown as AppliedEffect;

const blindness = effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' }, { kind: 'disadvantage', target: 'dodge' } ]);
const precision = effect('Precisão', [ { kind: 'advantage', target: 'attack' } ]);

describe('effectDice', () => {
    it('sem efeitos nada muda', () => {
        expect(effectDice([], 'attack')).toEqual({ advantages: 0, disadvantages: 0, notes: [] });
        expect(effectDice(undefined, 'dodge')).toEqual({ advantages: 0, disadvantages: 0, notes: [] });
    });

    it('cada efeito soma a vantagem ou a desvantagem do alvo pedido, com a origem', () => {
        expect(effectDice([ blindness, precision ], 'attack')).toEqual({
            advantages: 1,
            disadvantages: 1,
            notes: [ 'Cegueira: desvantagem, −1d20', 'Precisão: vantagem, +1d20' ]
        });
    });

    it('cada alvo conta só o que é dele (a esquiva não leva a vantagem de ataque)', () => {
        expect(effectDice([ blindness, precision ], 'dodge')).toMatchObject({ advantages: 0, disadvantages: 1 });
        expect(effectDice([ blindness, precision ], 'perception')).toMatchObject({ advantages: 0, disadvantages: 0 });
    });

    it('o efeito Furtivo não conta no acerto (o +1d20 dele já é regra própria), mas conta na Furtividade', () => {
        const stealthy = effect('Furtivo', [ { kind: 'flag', target: 'stealth' }, { kind: 'advantage', target: 'stealth' }, { kind: 'advantage', target: 'attack' } ]);

        expect(effectDice([ stealthy ], 'attack')).toMatchObject({ advantages: 0, notes: [] });
        expect(effectDice([ stealthy ], 'stealth')).toMatchObject({ advantages: 1 });
    });

    it('o nível aplicado manda: Cegueira nível 3 também atrapalha a Percepção', () => {
        const level3 = {
            ...blindness,
            level: 3,
            snapshot: { name: 'Cegueira', levels: [
                { level: 1, modifiers: [ { kind: 'disadvantage', target: 'attack' } ] },
                { level: 2, modifiers: [ { kind: 'disadvantage', target: 'attack' } ] },
                { level: 3, modifiers: [ { kind: 'disadvantage', target: 'attack' }, { kind: 'disadvantage', target: 'perception' } ] }
            ] }
        } as unknown as AppliedEffect;

        expect(effectDice([ level3 ], 'perception')).toMatchObject({ disadvantages: 1 });
        expect(effectDice([ { ...level3, level: 1 } as AppliedEffect ], 'perception')).toMatchObject({ disadvantages: 0 });
    });
});

describe('combatantEffects', () => {
    const combat = { isActive: true, combatants: [ { id: 'aria', effects: [ blindness ] }, { id: 'goblin-1', effects: [] } ] } as unknown as Combat;

    it('os efeitos do combatente em combate ativo', () => {
        expect(combatantEffects(combat, 'aria')).toEqual([ blindness ]);
        expect(combatantEffects(combat, 'goblin-1')).toEqual([]);
    });

    it('fora do combate, sem o combatente ou sem id não há efeito', () => {
        expect(combatantEffects({ ...combat, isActive: false } as Combat, 'aria')).toEqual([]);
        expect(combatantEffects(combat, 'fantasma')).toEqual([]);
        expect(combatantEffects(combat, undefined)).toEqual([]);
        expect(combatantEffects(undefined, 'aria')).toEqual([]);
    });
});

describe('adjustDice', () => {
    it('sem vantagem nem desvantagem devolve o plano como veio', () => {
        const plan = { dice: 2, keep: 'highest' as const };
        expect(adjustDice(plan, { advantages: 0, disadvantages: 0 })).toBe(plan);
    });

    it('uma vantagem num teste de 1 dado rola 2 e vale o maior; uma desvantagem rola 2 e vale o menor', () => {
        expect(adjustDice({ dice: 1, keep: 'highest' }, { advantages: 1, disadvantages: 0 })).toEqual({ dice: 2, keep: 'highest' });
        expect(adjustDice({ dice: 1, keep: 'highest' }, { advantages: 0, disadvantages: 1 })).toEqual({ dice: 2, keep: 'lowest' });
    });

    it('vantagem e desvantagem se cancelam (saldo líquido)', () => {
        expect(adjustDice({ dice: 1, keep: 'highest' }, { advantages: 1, disadvantages: 1 })).toEqual({ dice: 1, keep: 'highest' });
        expect(adjustDice({ dice: 1, keep: 'highest' }, { advantages: 2, disadvantages: 1 })).toEqual({ dice: 2, keep: 'highest' });
    });

    it('os d20 do mod do atributo já são vantagens: 3 dados e 1 desvantagem rolam 2 e valem o maior', () => {
        expect(adjustDice({ dice: 3, keep: 'highest' }, { advantages: 0, disadvantages: 1 })).toEqual({ dice: 2, keep: 'highest' });
        expect(adjustDice({ dice: 2, keep: 'highest' }, { advantages: 0, disadvantages: 3 })).toEqual({ dice: 3, keep: 'lowest' });
    });

    it('a desvantagem do mod negativo (2 dados, o menor) soma com a dos efeitos e some com uma vantagem', () => {
        expect(adjustDice({ dice: 2, keep: 'lowest' }, { advantages: 0, disadvantages: 1 })).toEqual({ dice: 3, keep: 'lowest' });
        expect(adjustDice({ dice: 2, keep: 'lowest' }, { advantages: 1, disadvantages: 0 })).toEqual({ dice: 1, keep: 'highest' });
        expect(adjustDice({ dice: 2, keep: 'lowest' }, { advantages: 2, disadvantages: 0 })).toEqual({ dice: 2, keep: 'highest' });
    });

    it('nunca passa do limite de dados', () => {
        expect(adjustDice({ dice: 1, keep: 'highest' }, { advantages: 50, disadvantages: 0 }, 20).dice).toBe(20);
    });
});

describe('keptDie / expertiseScope', () => {
    it('o d20 que vale: o maior ou o menor', () => {
        expect(keptDie([ 12, 7, 15 ], 'highest')).toBe(15);
        expect(keptDie([ 12, 7, 15 ], 'lowest')).toBe(7);
    });

    it('Percepção e Furtividade têm alvo próprio (sem caixa nem acento); as demais perícias não', () => {
        expect(expertiseScope('Percepção')).toBe('perception');
        expect(expertiseScope('percepcao')).toBe('perception');
        expect(expertiseScope('Furtividade')).toBe('stealth');
        expect(expertiseScope('Reflexos')).toBeNull();
        expect(expertiseScope('Atletismo')).toBeNull();
        expect(expertiseScope(undefined)).toBeNull();
    });
});
