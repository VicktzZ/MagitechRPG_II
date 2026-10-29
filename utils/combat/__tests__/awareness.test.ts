import type { AppliedEffect } from '@models';
import {
    addUnseen,
    attackSurprise,
    combatantVision,
    dropUnseenFor,
    groupByHider,
    hiddenFrom,
    MAX_OBSERVERS,
    MAX_UNSEEN,
    observerBlocked,
    perceptionDT,
    planHide,
    revealUnseen,
    sanitizeHiddenCause,
    sanitizeObserverIds,
    stealthDiceAlreadyRolled,
    surprisedField,
    surpriseDiceOwed,
    unseenEntry,
    type UnseenData
} from '../awareness';

const entry = (patch: Partial<UnseenData> = {}): UnseenData => ({
    id: 'u1', hiderId: 'kira', hiderName: 'Kira', observerId: 'orc-1', observerName: 'Orc', cause: 'furtivo', createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

const effectWith = (name: string, flags: string[] = []): AppliedEffect => ({
    id: 'e1', effectId: `seed-${name}`, level: 1, remaining: 3, snapshot: { name, levels: [ { level: 1, modifiers: flags.map(flag => ({ kind: 'flag', target: flag })) } ] }
}) as unknown as AppliedEffect;

const orc = { id: 'orc-1', name: 'Orc', effects: [] as AppliedEffect[] };
const kira = { id: 'kira', name: 'Kira' };
const sage = { id: 'sage', name: 'Sage', effects: [ effectWith('Visão Verdadeira', [ 'true_sight' ]) ] };

describe('sanitizeHiddenCause / sanitizeObserverIds', () => {
    it('só aceita as três causas conhecidas', () => {
        expect(sanitizeHiddenCause('furtivo')).toBe('furtivo');
        expect(sanitizeHiddenCause('invisivel')).toBe('invisivel');
        expect(sanitizeHiddenCause('outro')).toBe('outro');
        expect(sanitizeHiddenCause('invisível')).toBeNull();
        expect(sanitizeHiddenCause(undefined)).toBeNull();
    });

    it('os observadores são ids de texto, sem repetir, no máximo 30', () => {
        expect(sanitizeObserverIds([ 'orc-1', 'goblin-1', 'orc-1', '', 3, null, 'x'.repeat(81) ])).toEqual([ 'orc-1', 'goblin-1' ]);
        expect(sanitizeObserverIds('orc-1')).toEqual([]);
        expect(sanitizeObserverIds(Array.from({ length: 40 }, (_, index) => `o${index}`))).toHaveLength(MAX_OBSERVERS);
    });
});

describe('planHide', () => {
    it('cada observador do combate ganha um par com o nome dos dois e a causa', () => {
        const plan = planHide([ kira, orc ], 'kira', [ 'orc-1' ], 'invisivel');

        expect(plan.entries).toEqual([ { hiderId: 'kira', hiderName: 'Kira', observerId: 'orc-1', observerName: 'Orc', cause: 'invisivel' } ]);
        expect(plan.warnings).toEqual([]);
    });

    it('ignora o próprio escondido, avisa de quem saiu do combate e nada acontece se o escondido não existe', () => {
        const plan = planHide([ kira, orc ], 'kira', [ 'kira', 'fantasma', 'orc-1' ], 'furtivo');

        expect(plan.entries.map(item => item.observerId)).toEqual([ 'orc-1' ]);
        expect(plan.warnings).toEqual([ 'Um dos combatentes escolhidos não está mais no combate.' ]);
        expect(planHide([ orc ], 'kira', [ 'orc-1' ], 'furtivo')).toEqual({ entries: [], warnings: [] });
    });
});

describe('lista da matriz', () => {
    it('marcar de novo o mesmo par troca o anterior (mudar a causa é marcar de novo); outros pares ficam', () => {
        const list = [ entry({ id: 'u1' }), entry({ id: 'u2', observerId: 'goblin-1', observerName: 'Goblin' }) ];
        const updated = addUnseen(list, [ entry({ id: 'u3', cause: 'invisivel' }) ]);

        expect(updated.map(item => item.id)).toEqual([ 'u2', 'u3' ]);
        expect(unseenEntry(updated, 'kira', 'orc-1')?.cause).toBe('invisivel');
        expect(addUnseen(undefined, [ entry() ])).toHaveLength(1);
    });

    it('guarda no máximo as 60 mais novas', () => {
        const many = Array.from({ length: 70 }, (_, index) => entry({ id: `u${index}`, observerId: `o${index}` }));
        const updated = addUnseen([], many);

        expect(updated).toHaveLength(MAX_UNSEEN);
        expect(updated[0]!.id).toBe('u10');
    });

    it('revelar tira o escondido de todos os observadores, ou só dos indicados', () => {
        const list = [ entry({ id: 'u1' }), entry({ id: 'u2', observerId: 'goblin-1' }), entry({ id: 'u3', hiderId: 'caio', hiderName: 'Caio' }) ];

        expect(revealUnseen(list, 'kira').map(item => item.id)).toEqual([ 'u3' ]);
        expect(revealUnseen(list, 'kira', [ 'orc-1' ]).map(item => item.id)).toEqual([ 'u2', 'u3' ]);
        expect(revealUnseen(list, 'kira', []).map(item => item.id)).toEqual([ 'u1', 'u2', 'u3' ]);
        expect(revealUnseen(undefined, 'kira')).toEqual([]);
    });

    it('quem saiu do combate sai da matriz nos dois papéis', () => {
        const list = [
            entry({ id: 'u1' }),
            entry({ id: 'u2', hiderId: 'orc-1', hiderName: 'Orc', observerId: 'kira', observerName: 'Kira' }),
            entry({ id: 'u3', hiderId: 'caio', observerId: 'sage' })
        ];

        expect(dropUnseenFor(list, 'kira').map(item => item.id)).toEqual([ 'u3' ]);
        expect(dropUnseenFor(list, 'orc-1').map(item => item.id)).toEqual([ 'u3' ]);
    });

    it('consulta por escondido e agrupa por quem se esconde', () => {
        const list = [ entry({ id: 'u1' }), entry({ id: 'u2', hiderId: 'caio', hiderName: 'Caio' }), entry({ id: 'u3', observerId: 'goblin-1', observerName: 'Goblin' }) ];

        expect(hiddenFrom(list, 'kira').map(item => item.observerId)).toEqual([ 'orc-1', 'goblin-1' ]);
        expect(hiddenFrom(list, undefined)).toEqual([]);
        expect(groupByHider(list).map(group => [ group.hiderName, group.entries.length ])).toEqual([ [ 'Kira', 2 ], [ 'Caio', 1 ] ]);
        expect(groupByHider(undefined)).toEqual([]);
    });
});

describe('visão e causa', () => {
    it('a visão vem dos efeitos aplicados', () => {
        expect(combatantVision(orc)).toBe('normal');
        expect(combatantVision(sage)).toBe('verdadeira');
        expect(combatantVision({ effects: [ effectWith('Visão Aprimorada', [ 'dim_vision' ]) ] })).toBe('aprimorada');
    });

    it('a Visão Verdadeira anula só a furtividade: invisível e fora da vista continuam sem ser vistos', () => {
        expect(observerBlocked('furtivo')).toBe(true);
        expect(observerBlocked('furtivo', 'aprimorada')).toBe(true);
        expect(observerBlocked('furtivo', 'verdadeira')).toBe(false);
        expect(observerBlocked('invisivel', 'verdadeira')).toBe(true);
        expect(observerBlocked('outro', 'verdadeira')).toBe(true);
    });

    it('a DT de Percepção: 20 furtivo, 30 invisível, 15 invisível com Visão Verdadeira; sem DT para fora da vista e furtivo com Visão Verdadeira', () => {
        expect(perceptionDT('furtivo')).toBe(20);
        expect(perceptionDT('invisivel')).toBe(30);
        expect(perceptionDT('invisivel', 'verdadeira')).toBe(15);
        expect(perceptionDT('furtivo', 'verdadeira')).toBeNull();
        expect(perceptionDT('outro')).toBeNull();
    });
});

describe('surprisedField (a marca que o servidor põe no ataque pendente)', () => {
    const player = { id: 'borin', name: 'Borin', type: 'player' as const };
    const creature = { id: 'orc-1', name: 'Orc', type: 'creature' as const };

    it('jogador alvo que não via o atacante leva a marca, para a tela dele tirar a esquiva', () => {
        expect(surprisedField([ entry({ hiderId: 'kira', observerId: 'borin' }) ], 'kira', player)).toEqual({ surprised: true });
    });

    it('sem o par na matriz, ou com a Visão Verdadeira vendo o furtivo, não leva marca nenhuma', () => {
        expect(surprisedField([ entry({ hiderId: 'kira', observerId: 'outro' }) ], 'kira', player)).toEqual({});
        expect(surprisedField([], 'kira', player)).toEqual({});
        expect(surprisedField(undefined, 'kira', player)).toEqual({});
        expect(surprisedField([ entry({ hiderId: 'kira', observerId: 'borin' }) ], 'kira', { ...player, effects: sage.effects })).toEqual({});
    });

    it('alvo criatura não leva a marca (quem decide é o mestre, pelo cartão dele), nem alvo que não existe', () => {
        expect(surprisedField([ entry() ], 'kira', creature)).toEqual({});
        expect(surprisedField([ entry() ], 'kira', undefined)).toEqual({});
    });
});

describe('attackSurprise', () => {
    it('furtivo: o alvo que não o vê fica sem esquiva e o atacante ganha 1d20', () => {
        expect(attackSurprise([ entry() ], 'kira', orc)).toEqual({ cause: 'furtivo', advantages: 1, noDodge: true });
    });

    it('invisível: 2d20', () => {
        expect(attackSurprise([ entry({ cause: 'invisivel' }) ], 'kira', orc)).toEqual({ cause: 'invisivel', advantages: 2, noDodge: true });
    });

    it('fora da vista: sem esquiva, mas sem d20 (a regra só cita furtivo e invisível)', () => {
        expect(attackSurprise([ entry({ cause: 'outro' }) ], 'kira', orc)).toEqual({ cause: 'outro', advantages: 0, noDodge: true });
    });

    it('a Visão Verdadeira do alvo vê o furtivo (sem surpresa), mas não o invisível', () => {
        const target = { id: 'orc-1', name: 'Orc', effects: sage.effects };

        expect(attackSurprise([ entry() ], 'kira', target)).toBeNull();
        expect(attackSurprise([ entry({ cause: 'invisivel' }) ], 'kira', target)).toEqual({ cause: 'invisivel', advantages: 2, noDodge: true });
    });

    it('sem o par na matriz (ou a matriz vazia) o alvo via o atacante', () => {
        expect(attackSurprise([ entry() ], 'kira', { id: 'goblin-1', name: 'Goblin' })).toBeNull();
        expect(attackSurprise([ entry() ], 'caio', orc)).toBeNull();
        expect(attackSurprise(undefined, 'kira', orc)).toBeNull();
        expect(attackSurprise([ entry() ], 'kira', undefined)).toBeNull();
    });

    it('a matriz é de quem não vê: o escondido não perde a esquiva contra quem o atacou (o par é o contrário)', () => {
        expect(attackSurprise([ entry() ], 'orc-1', { id: 'kira', name: 'Kira' })).toBeNull();
    });
});

describe('d20 da surpresa que faltam', () => {
    it('o efeito Furtivo já deu 1d20 no acerto da arma, e só da arma', () => {
        const stealthy = [ effectWith('Furtivo') ];

        expect(stealthDiceAlreadyRolled('weapon', stealthy)).toBe(1);
        expect(stealthDiceAlreadyRolled('spell', stealthy)).toBe(0);
        expect(stealthDiceAlreadyRolled('manual', stealthy)).toBe(0);
        expect(stealthDiceAlreadyRolled('weapon', [])).toBe(0);
        expect(stealthDiceAlreadyRolled('weapon', undefined)).toBe(0);
    });

    it('o mestre rola só o que falta, nunca menos que zero', () => {
        expect(surpriseDiceOwed(1, 0)).toBe(1);
        expect(surpriseDiceOwed(1, 1)).toBe(0);
        expect(surpriseDiceOwed(2, 1)).toBe(1);
        expect(surpriseDiceOwed(0, 1)).toBe(0);
        expect(surpriseDiceOwed(2, -3)).toBe(2);
    });
});
