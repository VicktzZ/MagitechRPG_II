import type { Campaign } from '@models/entities';
import { WINDOW_TARGET_UNAVAILABLE, creatureWindowTargets, windowTargetName } from '../windowTargets';

const campaign = (overrides: Record<string, unknown> = {}): Campaign => ({
    custom: { creatures: [ { id: 'goblin', name: 'Goblin Saqueador' }, { id: 'wolf', name: 'Lobo' } ] },
    session: {
        combat: {
            isActive: true,
            combatants: [
                { id: 'cs-ana', name: 'Aria Valen', type: 'player' },
                { id: 'goblin-1', name: 'Goblin A', type: 'creature' },
                { id: 'goblin-2', name: 'Goblin B', type: 'creature' }
            ]
        }
    },
    ...overrides
}) as unknown as Campaign;

describe('creatureWindowTargets', () => {
    it('lista as criaturas da campanha e todos os combatentes (criaturas e jogadores)', () => {
        expect(creatureWindowTargets(campaign())).toEqual({ creatureIds: [ 'goblin', 'wolf' ], combatantIds: [ 'cs-ana', 'goblin-1', 'goblin-2' ] });
    });

    it('sem combate ativo não sobra combatente (combate encerrado fecha as janelas dele)', () => {
        const ended = campaign({ session: { combat: { isActive: false, combatants: [ { id: 'goblin-1', type: 'creature' } ] } } });
        expect(creatureWindowTargets(ended).combatantIds).toEqual([]);
    });

    it('campanha sem criaturas, sem combate ou ainda sem dados dá listas vazias', () => {
        expect(creatureWindowTargets(campaign({ custom: undefined, session: undefined }))).toEqual({ creatureIds: [], combatantIds: [] });
        expect(creatureWindowTargets(null)).toEqual({ creatureIds: [], combatantIds: [] });
        expect(creatureWindowTargets(campaign({ custom: { creatures: { 0: { id: 'x' } } } })).creatureIds).toEqual([]);
    });
});

describe('windowTargetName', () => {
    const sources = { charsheets: [ { id: 'cs-ana', name: 'Aria Valen' } ], campaign: campaign() };

    it('usa o nome da ficha, da criatura personalizada ou do combatente, conforme o tipo da janela', () => {
        expect(windowTargetName('notes', 'cs-ana', sources)).toBe('Aria Valen');
        expect(windowTargetName('creature', 'goblin', sources)).toBe('Goblin Saqueador');
        expect(windowTargetName('combatant', 'goblin-2', sources)).toBe('Goblin B');
    });

    it('o mesmo id em outro tipo de alvo não vale: procura só onde o tipo manda', () => {
        expect(windowTargetName('creature', 'goblin-1', sources)).toBe(WINDOW_TARGET_UNAVAILABLE.creature);
        expect(windowTargetName('summary', 'goblin', sources)).toBe(WINDOW_TARGET_UNAVAILABLE.sheet);
    });

    it('diz que está indisponível quando o alvo saiu', () => {
        expect(windowTargetName('summary', 'cs-removida', sources)).toBe('ficha indisponível');
        expect(windowTargetName('creature', 'excluida', sources)).toBe('criatura indisponível');
        expect(windowTargetName('combatant', 'goblin-9', sources)).toBe('combatente indisponível');
        expect(windowTargetName('combatant', 'goblin-1', { charsheets: [], campaign: undefined })).toBe('combatente indisponível');
    });
});
