import { Combat, Combatant } from '@models';
import {
    deepEqual, describeConflicts, diffSheetVitals, diffSnapshots, findConflicts, revertChanges, snapshotCombat, summarizeChanges
} from '../history';

const fighter = (id: string, patch: Partial<Combatant> = {}): Combatant =>
    new Combatant({ id, name: id.toUpperCase(), type: 'player', currentLp: 20, maxLp: 20, currentMp: 10, maxMp: 10, effects: [], ...patch });

const makeCombat = (patch: Partial<Combat> = {}): Combat =>
    new Combat({
        isActive: true,
        phase: 'ACTION',
        round: 1,
        currentTurnIndex: 0,
        combatants: [ fighter('a'), fighter('b'), fighter('c', { type: 'creature' }) ],
        logs: [],
        ...patch
    });

const names = { a: 'A', b: 'B', c: 'C' };

describe('deepEqual', () => {
    it('compara valores, listas e objetos; ausente vale null', () => {
        expect(deepEqual({ x: [ 1, { y: 2 } ] }, { x: [ 1, { y: 2 } ] })).toBe(true);
        expect(deepEqual({ x: 1 }, { x: 2 })).toBe(false);
        expect(deepEqual([ 1, 2 ], [ 1 ])).toBe(false);
        expect(deepEqual(undefined, null)).toBe(true);
        expect(deepEqual({ x: undefined }, {})).toBe(true);
        expect(deepEqual([], {})).toBe(false);
    });
});

describe('snapshotCombat / diffSnapshots', () => {
    it('sem mudança, sem diferença (os logs ficam de fora)', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.logs.push({ round: 1, type: 'action', actorId: 'x', actorName: 'X', message: 'oi' } as never);
        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([]);
    });

    it('os ataques pendentes ficam de fora (desfazer não apaga ataques declarados depois)', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.pendingAttacks = [ { id: 'a1' } as never ];
        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([]);
    });

    it('as oportunidades de ataque ficam de fora (duram só o turno de quem se move; desfazer a passagem do turno não as traz de volta)', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.opportunities = [ { id: 'o1' } as never ];
        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([]);
    });

    it('a matriz de percepção fica de fora (é decisão do mestre; desfazer um dano não esconde nem revela ninguém)', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.unseen = [ { id: 'u1' } as never ];
        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([]);
    });

    it('o ambiente (luz e terreno difícil) fica de fora: é decisão do mestre', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.environment = { light: 'escuridao', difficultTerrainIds: [ 'a' ] };
        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([]);
    });

    it('a foto é uma cópia: mexer no combate depois não muda a foto', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[0]!.currentLp = 1;
        expect(before.combatants['a']!['currentLp']).toBe(20);
    });

    it('dano vira uma mudança de campo do combatente', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;

        expect(diffSnapshots(before, snapshotCombat(combat))).toEqual([ { scope: 'field', id: 'b', field: 'currentLp', before: 20, after: 13 } ]);
    });

    it('passar o turno muda a vez; round novo muda round, fase e os campos de todos', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.currentTurnIndex = 1;
        combat.combatants[0]!.hasActed = true;

        const changes = diffSnapshots(before, snapshotCombat(combat));
        expect(changes).toEqual(expect.arrayContaining([
            { scope: 'combat', field: 'currentTurnIndex', before: 0, after: 1 },
            { scope: 'field', id: 'a', field: 'hasActed', before: false, after: true }
        ]));
    });

    it('quem entra e quem sai viram mudanças do combatente, e a ordem muda', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants.push(fighter('d'));
        combat.combatants.splice(0, 1);

        const changes = diffSnapshots(before, snapshotCombat(combat));
        expect(changes.filter(change => change.scope === 'combatant')).toEqual([
            expect.objectContaining({ id: 'a', after: null }),
            expect.objectContaining({ id: 'd', before: null })
        ]);
        expect(changes).toContainEqual({ scope: 'order', before: [ 'a', 'b', 'c' ], after: [ 'b', 'c', 'd' ] });
    });
});

describe('revertChanges', () => {
    it('devolve o dano e deixa o resto como está', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;
        const changes = diffSnapshots(before, snapshotCombat(combat));

        // depois do evento, outro combatente gastou MP: não tem a ver com o dano
        combat.combatants[0]!.mpSpentThisTurn = 4;

        revertChanges(combat, changes);

        expect(combat.combatants[1]!.currentLp).toBe(20);
        expect(combat.combatants[0]!.mpSpentThisTurn).toBe(4);
    });

    it('desfaz a virada de rodada: round, fase, vez e a iniciativa de todos', () => {
        const combat = makeCombat({ round: 2, phase: 'ACTION', currentTurnIndex: 2 });
        combat.combatants.forEach((entry, index) => {
            entry.initiativeRoll = 10 + index;
            entry.initiativeTotal = 12 + index;
            entry.hasActed = true;
        });
        const before = snapshotCombat(combat);

        combat.round = 3;
        combat.phase = 'INITIATIVE';
        combat.currentTurnIndex = 0;
        combat.combatants.forEach(entry => {
            entry.initiativeRoll = 0;
            entry.initiativeTotal = 0;
            entry.hasActed = false;
        });
        const changes = diffSnapshots(before, snapshotCombat(combat));

        revertChanges(combat, changes);

        expect(snapshotCombat(combat)).toEqual(before);
    });

    it('desfaz a entrada de um combatente e a volta de quem saiu, na ordem de antes', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants.push(fighter('d'));
        const [ removed ] = combat.combatants.splice(0, 1);
        const changes = diffSnapshots(before, snapshotCombat(combat));

        revertChanges(combat, changes);

        expect(combat.combatants.map(entry => entry.id)).toEqual([ 'a', 'b', 'c' ]);
        expect(combat.combatants[0]).toMatchObject({ id: removed.id, currentLp: 20 });
        expect(snapshotCombat(combat)).toEqual(before);
    });

    it('quem chegou depois do evento fica no fim e a vez nunca sai do intervalo', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants.reverse();
        const changes = diffSnapshots(before, snapshotCombat(combat));
        combat.combatants.push(fighter('z'));
        combat.currentTurnIndex = 9;

        revertChanges(combat, changes);

        expect(combat.combatants.map(entry => entry.id)).toEqual([ 'a', 'b', 'c', 'z' ]);
        expect(combat.currentTurnIndex).toBe(0);
    });

    it('desfaz o encerramento do combate (efeitos limpos voltam)', () => {
        const effect = { id: 'e1', effectId: 'seed-x', snapshot: { name: 'Sangramento' }, level: 1, remaining: 2 };
        const combat = makeCombat({ combatants: [ fighter('a', { effects: [ effect as never ] }), fighter('b') ] });
        const before = snapshotCombat(combat);

        combat.isActive = false;
        combat.phase = 'ENDED';
        combat.endedAt = '2026-10-28T10:00:00.000Z';
        combat.combatants[0]!.effects = [];
        const changes = diffSnapshots(before, snapshotCombat(combat));

        revertChanges(combat, changes);

        expect(combat.isActive).toBe(true);
        expect(combat.phase).toBe('ACTION');
        expect(combat.endedAt).toBeUndefined();
        expect(combat.combatants[0]!.effects).toHaveLength(1);
    });
});

describe('findConflicts', () => {
    it('sem nada depois do evento, não há conflito', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;
        const after = snapshotCombat(combat);
        const changes = diffSnapshots(before, after);

        expect(findConflicts(after, changes)).toEqual([]);
    });

    it('o campo que mudou de novo depois do evento é conflito; o resto não', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;
        combat.combatants[0]!.currentLp = 18;
        const changes = diffSnapshots(before, snapshotCombat(combat));

        combat.combatants[1]!.currentLp = 5; // outro golpe em B
        const conflicts = findConflicts(snapshotCombat(combat), changes);

        expect(conflicts).toEqual([ { scope: 'field', id: 'b', field: 'currentLp', before: 20, after: 13 } ]);
        expect(describeConflicts(conflicts, names)).toEqual([ 'B: Vida mudou de novo' ]);
    });

    it('combatente removido depois, ou ordem alterada depois, também é conflito', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;
        combat.combatants.reverse();
        const changes = diffSnapshots(before, snapshotCombat(combat));

        combat.combatants.splice(1, 1);
        const kinds = findConflicts(snapshotCombat(combat), changes).map(change => change.scope);
        expect(kinds).toEqual(expect.arrayContaining([ 'order' ]));
    });
});

describe('diffSheetVitals', () => {
    it('lista só o que mudou na vida e na mana das fichas', () => {
        expect(diffSheetVitals(
            { a: { lp: 20, mp: 10 }, b: { lp: 20, mp: 10 }, gone: { lp: 1, mp: 1 } },
            { a: { lp: 13, mp: 10 }, b: { lp: 20, mp: 7 } }
        )).toEqual([
            { sheetId: 'a', stat: 'lp', before: 20, after: 13 },
            { sheetId: 'b', stat: 'mp', before: 10, after: 7 }
        ]);
    });
});

describe('summarizeChanges', () => {
    it('conta o que aconteceu em português', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants[1]!.currentLp = 13;
        combat.combatants[0]!.effects = [ { id: 'e1', snapshot: { name: 'Furtivo' } } as never ];
        const changes = diffSnapshots(before, snapshotCombat(combat));

        expect(summarizeChanges(changes, names)).toEqual(expect.arrayContaining([ 'B: Vida 20 → 13', 'A: ganhou Furtivo' ]));
    });

    it('virada de rodada: uma linha por campo, não uma por combatente', () => {
        const combat = makeCombat({ round: 1, currentTurnIndex: 2 });
        combat.combatants.forEach(entry => { entry.hasActed = true; entry.initiativeRoll = 9; entry.initiativeTotal = 11; });
        const before = snapshotCombat(combat);

        combat.round = 2;
        combat.phase = 'INITIATIVE';
        combat.currentTurnIndex = 0;
        combat.combatants.forEach(entry => { entry.hasActed = false; entry.initiativeRoll = 0; entry.initiativeTotal = 0; });
        const lines = summarizeChanges(diffSnapshots(before, snapshotCombat(combat)), names);

        expect(lines).toEqual(expect.arrayContaining([ 'Round 1 → 2', 'Fase: Ação → Iniciativa', 'Já agiu: 3 combatentes', 'Iniciativa: 3 combatentes' ]));
        expect(lines.length).toBeLessThan(10);
    });

    it('limita o tamanho e diz quantas ficaram de fora', () => {
        const many = Array.from({ length: 20 }, (_, index) => fighter(`p${index}`));
        const combat = makeCombat({ combatants: many });
        const before = snapshotCombat(combat);
        many.forEach(entry => { entry.currentLp = 1; });
        const namesMany = Object.fromEntries(many.map(entry => [ entry.id, entry.name ]));

        const lines = summarizeChanges(diffSnapshots(before, snapshotCombat(combat)), namesMany);
        expect(lines).toHaveLength(12);
        expect(lines.at(-1)).toBe('…e mais 9 alterações');
    });

    it('quem entra ou sai aparece, e a ordem sozinha não repete a informação', () => {
        const combat = makeCombat();
        const before = snapshotCombat(combat);
        combat.combatants.push(fighter('d'));
        const lines = summarizeChanges(diffSnapshots(before, snapshotCombat(combat)), { ...names, d: 'D' });

        expect(lines).toEqual([ 'D entrou no combate' ]);
    });
});
