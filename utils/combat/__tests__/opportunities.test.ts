import {
    addOpportunities,
    dropOpportunitiesFor,
    findOpportunity,
    isOpportunitySpell,
    isOpportunityWeapon,
    MAX_OPPORTUNITIES,
    opportunitiesByMover,
    opportunitiesForReactor,
    planLeaveReach,
    removeOpportunity,
    sanitizeReactorIds,
    type OpportunityData
} from '../opportunities';
import type { UnseenData } from '../awareness';

const entry = (patch: Partial<OpportunityData> = {}): OpportunityData => ({
    id: 'o1', moverId: 'caio', moverName: 'Caio', reactorId: 'goblin-1', reactorName: 'Goblin', createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

const caio = { id: 'caio', name: 'Caio' };
const goblin = { id: 'goblin-1', name: 'Goblin' };
const orc = { id: 'orc-1', name: 'Orc', actions: { padrao: 1, bonus: 1, movimento: 1, reacao: 0 } };

describe('sanitizeReactorIds', () => {
    it('aceita ids de texto, sem repetir', () => {
        expect(sanitizeReactorIds([ 'goblin-1', 'orc-1', 'goblin-1' ])).toEqual([ 'goblin-1', 'orc-1' ]);
    });

    it('descarta o que não é id e limita a quantidade', () => {
        expect(sanitizeReactorIds([ 'a', '', '  ', 3, null, { id: 'x' }, 'x'.repeat(81) ])).toEqual([ 'a' ]);
        expect(sanitizeReactorIds('goblin-1')).toEqual([]);
        expect(sanitizeReactorIds(undefined)).toEqual([]);
        expect(sanitizeReactorIds(Array.from({ length: 40 }, (_, index) => `c${index}`))).toHaveLength(MAX_OPPORTUNITIES);
    });
});

describe('planLeaveReach', () => {
    it('cada inimigo ao alcance, com a Reação, ganha uma oportunidade', () => {
        const plan = planLeaveReach([ caio, goblin ], 'caio', [ 'goblin-1' ]);

        expect(plan.opportunities).toEqual([ { moverId: 'caio', moverName: 'Caio', reactorId: 'goblin-1', reactorName: 'Goblin' } ]);
        expect(plan.warnings).toEqual([]);
    });

    it('quem já gastou a Reação não ganha, e o aviso diz o porquê', () => {
        const plan = planLeaveReach([ caio, goblin, orc ], 'caio', [ 'goblin-1', 'orc-1' ]);

        expect(plan.opportunities.map(opportunity => opportunity.reactorId)).toEqual([ 'goblin-1' ]);
        expect(plan.warnings).toEqual([ 'Orc não tem a Reação disponível: sem ataque de oportunidade.' ]);
    });

    it('ignora o próprio personagem, avisa de quem já saiu do combate e nada acontece se quem saiu não existe', () => {
        const plan = planLeaveReach([ caio, goblin ], 'caio', [ 'caio', 'fantasma', 'goblin-1' ]);

        expect(plan.opportunities.map(opportunity => opportunity.reactorId)).toEqual([ 'goblin-1' ]);
        expect(plan.warnings).toEqual([ 'Um dos combatentes escolhidos não está mais no combate.' ]);
        expect(planLeaveReach([ goblin ], 'caio', [ 'goblin-1' ])).toEqual({ opportunities: [], warnings: [] });
    });
});

describe('planLeaveReach com a matriz de percepção', () => {
    const hiddenFromGoblin: UnseenData = { id: 'u1', hiderId: 'caio', hiderName: 'Caio', observerId: 'goblin-1', observerName: 'Goblin', cause: 'furtivo', createdAt: '2026-10-28T12:00:00.000Z' };

    it('o inimigo que não vê quem saiu não ganha oportunidade, e o aviso diz o porquê', () => {
        const plan = planLeaveReach([ caio, goblin, orc ], 'caio', [ 'goblin-1', 'orc-1' ], [ hiddenFromGoblin ]);

        expect(plan.opportunities).toEqual([]);
        expect(plan.warnings).toEqual([
            'Goblin não tinha visto quem saiu: sem ataque de oportunidade.',
            'Orc não tem a Reação disponível: sem ataque de oportunidade.'
        ]);
    });

    it('só vale para o par da matriz: outro inimigo que o via ainda reage', () => {
        const plan = planLeaveReach([ caio, goblin, { id: 'imp-1', name: 'Imp' } ], 'caio', [ 'goblin-1', 'imp-1' ], [ hiddenFromGoblin ]);

        expect(plan.opportunities.map(opportunity => opportunity.reactorId)).toEqual([ 'imp-1' ]);
    });

    it('Visão Verdadeira vê o furtivo sozinha, mas não o invisível', () => {
        const sight = { id: 'e1', effectId: 'x', level: 1, remaining: 3, snapshot: { name: 'Visão Verdadeira', levels: [ { level: 1, modifiers: [ { kind: 'flag', target: 'true_sight' } ] } ] } };
        const trueSight = { ...goblin, effects: [ sight as never ] };

        expect(planLeaveReach([ caio, trueSight ], 'caio', [ 'goblin-1' ], [ hiddenFromGoblin ]).opportunities).toHaveLength(1);
        expect(planLeaveReach([ caio, trueSight ], 'caio', [ 'goblin-1' ], [ { ...hiddenFromGoblin, cause: 'invisivel' } ]).opportunities).toHaveLength(0);
    });
});

describe('lista de oportunidades', () => {
    it('declarar de novo a mesma saída troca a anterior; outras ficam', () => {
        const list = [ entry({ id: 'o1' }), entry({ id: 'o2', reactorId: 'orc-1', reactorName: 'Orc' }) ];
        const updated = addOpportunities(list, [ entry({ id: 'o3' }) ]);

        expect(updated.map(item => item.id)).toEqual([ 'o2', 'o3' ]);
        expect(addOpportunities(undefined, [ entry() ])).toHaveLength(1);
    });

    it('guarda no máximo as 20 mais novas', () => {
        const many = Array.from({ length: 25 }, (_, index) => entry({ id: `o${index}`, reactorId: `r${index}` }));

        const updated = addOpportunities([], many);
        expect(updated).toHaveLength(MAX_OPPORTUNITIES);
        expect(updated[0]!.id).toBe('o5');
    });

    it('remove uma oportunidade e as de quem saiu do combate (quem se moveu ou quem ia reagir)', () => {
        const list = [ entry({ id: 'o1' }), entry({ id: 'o2', moverId: 'orc-1' }), entry({ id: 'o3', reactorId: 'orc-1' }) ];

        expect(removeOpportunity(list, 'o1').map(item => item.id)).toEqual([ 'o2', 'o3' ]);
        expect(removeOpportunity(undefined, 'o1')).toEqual([]);
        expect(dropOpportunitiesFor(list, 'orc-1').map(item => item.id)).toEqual([ 'o1' ]);
    });

    it('acha as oportunidades por inimigo, por quem se moveu e o par exato', () => {
        const list = [ entry({ id: 'o1' }), entry({ id: 'o2', reactorId: 'orc-1' }), entry({ id: 'o3', moverId: 'ana' }) ];

        expect(opportunitiesForReactor(list, 'orc-1').map(item => item.id)).toEqual([ 'o2' ]);
        expect(opportunitiesByMover(list, 'caio').map(item => item.id)).toEqual([ 'o1', 'o2' ]);
        expect(findOpportunity(list, 'goblin-1', 'ana')?.id).toBe('o3');
        expect(findOpportunity(list, 'goblin-1', 'orc-1')).toBeUndefined();
        expect(opportunitiesForReactor(list, undefined)).toEqual([]);
        expect(opportunitiesByMover(undefined, 'caio')).toEqual([]);
    });
});

describe('o que serve de ataque de oportunidade', () => {
    it('só arma branca (corpo a corpo): arma de fogo e de energia não fazem', () => {
        expect(isOpportunityWeapon({ categ: 'Arma Branca', range: 'Corpo-a-corpo' })).toBe(true);
        expect(isOpportunityWeapon({ categ: 'arma branca', range: 'Curto (3m)' })).toBe(true);
        expect(isOpportunityWeapon({ categ: 'Arma de Fogo', range: 'Longo (30m)' })).toBe(false);
        expect(isOpportunityWeapon({ categ: 'Arma de Energia', range: 'Médio' })).toBe(false);
    });

    it('magia de Reação de alcance Curto; Toque, Visão e Pessoal não', () => {
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Curto' })).toBe(true);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Toque' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Visão' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Pessoal' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Padrão', range: 'Curto' })).toBe(false);
    });
});
