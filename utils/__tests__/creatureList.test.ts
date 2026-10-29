import type { Creature } from '@models';
import {
    CREATURE_SORT_OPTIONS, creatureCopiesInCombat, creatureSearchText, creatureTypeCounts, duplicateCreatureBody, filterAndSortCreatures, NO_TYPE, summarizeCreatures
} from '../creatureList';

const creature = (patch: Record<string, unknown>): Creature => ({ id: 'x', name: 'X', level: 1, stats: { lp: 10, maxLp: 10 }, ...patch }) as unknown as Creature;

const goblin = creature({ id: 'g', name: 'Goblin Saqueador', type: 'Humanoide', level: 3, stats: { lp: 20, maxLp: 25 }, description: 'Rouba o que vê.', skills: [ { name: 'Emboscada' } ], spells: [ { name: 'Fagulha' } ] });
const lobo = creature({ id: 'l', name: 'Lobo Cinzento', type: 'Fera', level: 2, stats: { lp: 30, maxLp: 30 }, dices: [ { id: 'd', name: 'Mordida' } ] });
const dragao = creature({ id: 'd', name: 'Dragão Ancião', type: 'Dragão', level: 20, stats: { lp: 400, maxLp: 400 } });
const sombra = creature({ id: 's', name: 'Ágil Sombra', level: 3, stats: { lp: 5 } });
const all = [ goblin, lobo, dragao, sombra ];

const names = (list: Creature[]): string[] => list.map(item => item.name);

describe('filterAndSortCreatures', () => {
    it('sem busca nem filtro mostra todas em ordem alfabética (sem acento nem caixa para ordenar)', () => {
        expect(names(filterAndSortCreatures(all))).toEqual([ 'Ágil Sombra', 'Dragão Ancião', 'Goblin Saqueador', 'Lobo Cinzento' ]);
    });

    it('não altera a lista recebida', () => {
        const before = names(all);
        filterAndSortCreatures(all, { sort: 'level-desc' });
        expect(names(all)).toEqual(before);
    });

    it('busca sem acento nem caixa em nome, tipo, descrição, habilidades, magias e dados', () => {
        expect(names(filterAndSortCreatures(all, { query: 'dragao' }))).toEqual([ 'Dragão Ancião' ]);
        expect(names(filterAndSortCreatures(all, { query: 'FERA' }))).toEqual([ 'Lobo Cinzento' ]);
        expect(names(filterAndSortCreatures(all, { query: 'rouba' }))).toEqual([ 'Goblin Saqueador' ]);
        expect(names(filterAndSortCreatures(all, { query: 'emboscada' }))).toEqual([ 'Goblin Saqueador' ]);
        expect(names(filterAndSortCreatures(all, { query: 'fagulha' }))).toEqual([ 'Goblin Saqueador' ]);
        expect(names(filterAndSortCreatures(all, { query: 'mordida' }))).toEqual([ 'Lobo Cinzento' ]);
        expect(filterAndSortCreatures(all, { query: 'inexistente' })).toEqual([]);
    });

    it('cada palavra da busca precisa aparecer, em qualquer ordem', () => {
        expect(names(filterAndSortCreatures(all, { query: 'saqueador goblin' }))).toEqual([ 'Goblin Saqueador' ]);
        expect(filterAndSortCreatures(all, { query: 'goblin lobo' })).toEqual([]);
    });

    it('filtra por tipo, inclusive as sem tipo', () => {
        expect(names(filterAndSortCreatures(all, { type: 'Fera' }))).toEqual([ 'Lobo Cinzento' ]);
        expect(names(filterAndSortCreatures(all, { type: NO_TYPE }))).toEqual([ 'Ágil Sombra' ]);
    });

    it('as ordens por nível, vida, tipo e mais recentes (empate pelo nome)', () => {
        expect(names(filterAndSortCreatures(all, { sort: 'level-desc' }))).toEqual([ 'Dragão Ancião', 'Ágil Sombra', 'Goblin Saqueador', 'Lobo Cinzento' ]);
        expect(names(filterAndSortCreatures(all, { sort: 'level-asc' }))).toEqual([ 'Lobo Cinzento', 'Ágil Sombra', 'Goblin Saqueador', 'Dragão Ancião' ]);
        expect(names(filterAndSortCreatures(all, { sort: 'lp-desc' }))).toEqual([ 'Dragão Ancião', 'Lobo Cinzento', 'Goblin Saqueador', 'Ágil Sombra' ]);
        expect(names(filterAndSortCreatures(all, { sort: 'type' }))).toEqual([ 'Dragão Ancião', 'Lobo Cinzento', 'Goblin Saqueador', 'Ágil Sombra' ]);
        expect(names(filterAndSortCreatures(all, { sort: 'recent' }))).toEqual([ 'Ágil Sombra', 'Dragão Ancião', 'Lobo Cinzento', 'Goblin Saqueador' ]);
    });

    it('criatura de formato antigo ou incompleto não quebra a busca nem a ordem', () => {
        const broken = [ creature({ name: undefined, level: 'x', stats: null, skills: 'lixo', type: 5 }), goblin ];
        expect(() => filterAndSortCreatures(broken, { query: 'goblin', sort: 'lp-desc' })).not.toThrow();
        expect(filterAndSortCreatures(broken, { sort: 'level-desc' })).toHaveLength(2);
    });

    it('todas as ordens oferecidas funcionam', () => {
        for (const option of CREATURE_SORT_OPTIONS) expect(filterAndSortCreatures(all, { sort: option.value })).toHaveLength(4);
    });
});

describe('creatureSearchText', () => {
    it('junta o que a busca enxerga', () => {
        const text = creatureSearchText(goblin);
        expect(text).toContain('Goblin Saqueador');
        expect(text).toContain('Humanoide');
        expect(text).toContain('Emboscada');
        expect(text).toContain('Fagulha');
    });
});

describe('creatureTypeCounts e summarizeCreatures', () => {
    it('conta por tipo, do mais comum ao menos; as sem tipo por último', () => {
        const counts = creatureTypeCounts([ ...all, creature({ id: 'f2', name: 'Raposa', type: 'Fera' }) ]);
        expect(counts.map(entry => [ entry.label, entry.count ])).toEqual([ [ 'Fera', 2 ], [ 'Dragão', 1 ], [ 'Humanoide', 1 ], [ 'Sem tipo', 1 ] ]);
        expect(counts[counts.length - 1]!.type).toBe(NO_TYPE);
    });

    it('resumo com total, nível médio (uma casa) e maior nível; vazio vale 0', () => {
        expect(summarizeCreatures(all)).toEqual({ total: 4, averageLevel: 7, highestLevel: 20 });
        expect(summarizeCreatures([ goblin, lobo ]).averageLevel).toBe(2.5);
        expect(summarizeCreatures([])).toEqual({ total: 0, averageLevel: 0, highestLevel: 0 });
    });
});

describe('creatureCopiesInCombat', () => {
    const combatants = [
        { id: 'g-1', type: 'creature' }, { id: 'g-2', type: 'creature' }, { id: 'g', type: 'creature' },
        { id: 'g-extra', type: 'creature' }, { id: 'gg-1', type: 'creature' }, { id: 'g-3', type: 'player' }
    ];

    it('conta a criatura e suas cópias "-n", sem confundir com outro id parecido nem com jogador', () => {
        expect(creatureCopiesInCombat('g', combatants)).toBe(3);
        expect(creatureCopiesInCombat('l', combatants)).toBe(0);
        expect(creatureCopiesInCombat('g', undefined)).toBe(0);
    });

    it('id com caracteres especiais não quebra a conta', () => {
        expect(creatureCopiesInCombat('a.b(1)', [ { id: 'a.b(1)-1', type: 'creature' }, { id: 'axb(1)-1', type: 'creature' } ])).toBe(1);
    });
});

describe('duplicateCreatureBody', () => {
    it('copia tudo menos o id e põe "(cópia)" no nome', () => {
        const body = duplicateCreatureBody(creature({ id: 'g', name: 'Goblin', level: 3, weaknesses: [ 'Fogo' ], dices: [ { id: 'd', name: 'Mordida' } ] }), [ 'Goblin' ]);

        expect(body['id']).toBeUndefined();
        expect(body['name']).toBe('Goblin (cópia)');
        expect(body['level']).toBe(3);
        expect(body['weaknesses']).toEqual([ 'Fogo' ]);
        expect(body['dices']).toEqual([ { id: 'd', name: 'Mordida' } ]);
    });

    it('a cópia é independente do original (mexer nela não mexe nele)', () => {
        const original = creature({ name: 'Goblin', skills: [ { id: 's', name: 'Emboscada' } ] });
        const body = duplicateCreatureBody(original, []);
        (body['skills'] as Array<{ name: string }>)[0]!.name = 'Outra';
        expect((original as unknown as { skills: Array<{ name: string }> }).skills[0]!.name).toBe('Emboscada');
    });

    it('já existindo "(cópia)" numera: "(cópia 2)", "(cópia 3)"', () => {
        expect(duplicateCreatureBody(creature({ name: 'Goblin' }), [ 'Goblin', 'Goblin (cópia)' ])['name']).toBe('Goblin (cópia 2)');
        expect(duplicateCreatureBody(creature({ name: 'Goblin' }), [ 'goblin (CÓPIA)', 'Goblin (cópia 2)' ])['name']).toBe('Goblin (cópia 3)');
    });

    it('sem nome vira "Criatura (cópia)"', () => {
        expect(duplicateCreatureBody(creature({ name: '  ' }), [])['name']).toBe('Criatura (cópia)');
    });
});
