import type { Combatant, Creature } from '@models';
import { baseCreatureId, creatureCombatants, findBaseCreature } from '../combatCreatureLookup';

const creature = (id: string): Creature => ({ id, name: `Criatura ${id}` }) as unknown as Creature;
const combatant = (id: string, type: 'player' | 'creature' = 'creature'): Combatant => ({ id, name: id, type }) as unknown as Combatant;

describe('baseCreatureId', () => {
    const creatures = [ creature('goblin'), creature('4f6c-aa10-9b2e') ];

    it('o combatente com o id da própria criatura é ela mesma', () => {
        expect(baseCreatureId('goblin', creatures)).toBe('goblin');
        expect(baseCreatureId('4f6c-aa10-9b2e', creatures)).toBe('4f6c-aa10-9b2e');
    });

    it('cópia no combate leva um sufixo depois do último hífen e volta para o id da criatura', () => {
        expect(baseCreatureId('goblin-2', creatures)).toBe('goblin');
        // ids com hífen (uuid) também: só o último trecho é sufixo
        expect(baseCreatureId('4f6c-aa10-9b2e-3', creatures)).toBe('4f6c-aa10-9b2e');
    });

    it('se o que vem antes do hífen não é uma criatura da campanha, o id fica como está', () => {
        expect(baseCreatureId('orc-1', creatures)).toBe('orc-1');
        expect(baseCreatureId('-1', creatures)).toBe('-1');
        expect(baseCreatureId('goblin', [])).toBe('goblin');
    });
});

describe('findBaseCreature', () => {
    const creatures = [ creature('goblin'), creature('wolf') ];

    it('acha a criatura do combatente, com ou sem sufixo', () => {
        expect(findBaseCreature('wolf', creatures)?.id).toBe('wolf');
        expect(findBaseCreature('goblin-7', creatures)?.id).toBe('goblin');
    });

    it('devolve nada quando a criatura foi excluída da campanha', () => {
        expect(findBaseCreature('troll-1', creatures)).toBeUndefined();
        expect(findBaseCreature('goblin-1', [])).toBeUndefined();
    });
});

describe('creatureCombatants', () => {
    it('fica só com as criaturas (jogadores têm janela pela ficha)', () => {
        const list = [ combatant('p1', 'player'), combatant('c1'), combatant('p2', 'player'), combatant('c2') ];
        expect(creatureCombatants(list).map(item => item.id)).toEqual([ 'c1', 'c2' ]);
    });

    it('lista ausente ou que não é lista vira vazia', () => {
        expect(creatureCombatants(undefined)).toEqual([]);
        expect(creatureCombatants({ 0: combatant('c1') } as unknown as Combatant[])).toEqual([]);
    });
});
