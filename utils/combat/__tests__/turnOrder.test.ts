import type { Combat, Combatant } from '@models';
import { describeTurnsUntil, initialsOf, summarizeTurnOrder } from '../turnOrder';

const combatant = (id: string, name: string, type: Combatant['type'], extra: Partial<Combatant> = {}): Combatant =>
    ({ id, name, type, initiativeRoll: 10, initiativeBonus: 0, initiativeTotal: 10, hasActed: false, currentLp: 20, maxLp: 40, effects: [], ...extra }) as Combatant;

const combat = (overrides: Partial<Combat> = {}): Combat => ({
    isActive: true,
    phase: 'ACTION',
    round: 3,
    currentTurnIndex: 1,
    combatants: [
        combatant('cs-ana', 'Aria Valen', 'player', { initiativeTotal: 21 }),
        combatant('cs-bia', 'Borin Pedraferro', 'player', { initiativeTotal: 18, hasActed: true }),
        combatant('goblin-1', 'Goblin Saqueador', 'creature', { initiativeTotal: 15, currentLp: 9, maxLp: 20 }),
        combatant('goblin-2', 'Goblin (2)', 'creature', { initiativeTotal: 9 })
    ],
    ...overrides
}) as Combat;

describe('iniciais do retrato', () => {
    it('duas palavras: primeira e última; uma só: as duas primeiras letras', () => {
        expect(initialsOf('Aria Valen')).toBe('AV');
        expect(initialsOf('Maria da Silva Souza')).toBe('MS');
        expect(initialsOf('goblin')).toBe('GO');
        expect(initialsOf('Goblin Saqueador (2)')).toBe('GS');
        expect(initialsOf('(2)')).toBe('(2');
        expect(initialsOf('  ')).toBe('?');
    });
});

describe('ordem de turnos', () => {
    it('sem combate não há ordem', () => {
        expect(summarizeTurnOrder(null)).toBeNull();
        expect(summarizeTurnOrder(undefined)).toBeNull();
    });

    it('marca quem tem a vez e quem está vendo, e diz quantos turnos faltam', () => {
        const summary = summarizeTurnOrder(combat(), { viewerId: 'cs-ana' })!;
        expect(summary.round).toBe(3);
        expect(summary.currentName).toBe('Borin Pedraferro');
        expect(summary.items.map(item => [ item.id, item.isCurrent, item.isViewer ])).toEqual([
            [ 'cs-ana', false, true ],
            [ 'cs-bia', true, false ],
            [ 'goblin-1', false, false ],
            [ 'goblin-2', false, false ]
        ]);
        // Aria é a primeira da lista e o turno está no segundo: a vez dela volta depois de 3 turnos (a lista dá a volta)
        expect(summary.turnsUntilViewer).toBe(3);
        expect(summary.viewerIsCurrent).toBe(false);
    });

    it('é a vez de quem está vendo: agora', () => {
        const summary = summarizeTurnOrder(combat({ currentTurnIndex: 0 }), { viewerId: 'cs-ana' })!;
        expect(summary.viewerIsCurrent).toBe(true);
        expect(summary.turnsUntilViewer).toBe(0);
        expect(describeTurnsUntil(summary.turnsUntilViewer)).toBe('Agora');
    });

    it('a vez de quem está vendo é a seguinte: próximo', () => {
        const summary = summarizeTurnOrder(combat({ currentTurnIndex: 0 }), { viewerId: 'cs-bia' })!;
        expect(summary.turnsUntilViewer).toBe(1);
        expect(describeTurnsUntil(1)).toBe('Próximo');
        expect(describeTurnsUntil(4)).toBe('Em 4 turnos');
        expect(describeTurnsUntil(null)).toBeNull();
    });

    it('na fase de iniciativa ninguém tem a vez, ninguém "já agiu" e não há contagem', () => {
        const summary = summarizeTurnOrder(combat({ phase: 'INITIATIVE', currentTurnIndex: 0 }), { viewerId: 'cs-ana' })!;
        expect(summary.currentName).toBeNull();
        expect(summary.items.some(item => item.isCurrent || item.hasActed)).toBe(false);
        expect(summary.turnsUntilViewer).toBeNull();
        expect(summary.viewerIsCurrent).toBe(false);
    });

    it('quem já agiu na rodada vem marcado; a iniciativa só aparece depois de rolada', () => {
        const summary = summarizeTurnOrder(combat({
            combatants: [ combatant('a', 'A', 'player', { hasActed: true }), combatant('b', 'B', 'player', { initiativeTotal: 0 }) ]
        } as Partial<Combat>), { viewerId: 'a' })!;
        expect(summary.items[0]).toMatchObject({ hasActed: true, initiative: 10 });
        expect(summary.items[1]).toMatchObject({ hasActed: false, initiative: null });
    });

    it('viewer que não está no combate: sem contagem', () => {
        const summary = summarizeTurnOrder(combat(), { viewerId: 'cs-fora' })!;
        expect(summary.turnsUntilViewer).toBeNull();
        expect(summary.items.some(item => item.isViewer)).toBe(false);
    });

    it('o LP do jogador vem da ficha quando há; a criatura só tem LP à mostra se o mestre deixou', () => {
        const options = { viewerId: 'cs-ana', playerLp: (c: Combatant) => (c.id === 'cs-ana' ? { lp: 10, maxLp: 20 } : null) };
        const hidden = summarizeTurnOrder(combat(), options)!;
        expect(hidden.items[0]!.lp).toEqual({ current: 10, max: 20, percent: 50 });
        // sem a ficha, vale o do combatente (20/40)
        expect(hidden.items[1]!.lp).toEqual({ current: 20, max: 40, percent: 50 });
        expect(hidden.items[2]!.lp).toBeNull();

        const shown = summarizeTurnOrder(combat(), { ...options, showCreatureLp: true })!;
        expect(shown.items[2]!.lp).toEqual({ current: 9, max: 20, percent: 45 });
    });

    it('LP sem máximo, zerado ou fora do intervalo não quebra a barra', () => {
        const summary = summarizeTurnOrder(combat({
            combatants: [
                combatant('a', 'A', 'player', { currentLp: 70, maxLp: 40 }),
                combatant('b', 'B', 'player', { currentLp: -5, maxLp: 40 }),
                combatant('c', 'C', 'player', { currentLp: 5, maxLp: 0 })
            ]
        } as Partial<Combat>))!;
        expect(summary.items[0]!.lp!.percent).toBe(100);
        expect(summary.items[1]!.lp!.percent).toBe(0);
        expect(summary.items[2]!.lp).toBeNull();
    });

    it('lista os nomes dos efeitos aplicados e ignora efeito sem nome', () => {
        const effects = [ { snapshot: { name: 'Cegueira' } }, { snapshot: { name: '  ' } }, { snapshot: undefined } ] as unknown as Combatant['effects'];
        const summary = summarizeTurnOrder(combat({ combatants: [ combatant('a', 'A', 'player', { effects }) ] } as Partial<Combat>))!;
        expect(summary.items[0]!.effects).toEqual([ 'Cegueira' ]);
    });

    it('lista de combatentes ausente vira ordem vazia', () => {
        const summary = summarizeTurnOrder({ round: 1, phase: 'ACTION', currentTurnIndex: 0, combatants: undefined } as unknown as Combat)!;
        expect(summary.items).toEqual([]);
        expect(summary.currentName).toBeNull();
    });
});
