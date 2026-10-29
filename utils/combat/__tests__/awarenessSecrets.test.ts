import type { UnseenData } from '../awareness';
import {
    attachAwareness, awarenessFromDocs, campaignWithoutUnseen, combatWithoutUnseen, hiddenNoticesByUser, resolveUnseen, sameUnseen, sanitizeAwarenessEntries, sanitizeHiddenNotices
} from '../awarenessSecrets';

const entry = (patch: Partial<UnseenData> = {}): UnseenData => ({
    id: 'u1', hiderId: 'aria', hiderName: 'Aria', observerId: 'goblin-1', observerName: 'Goblin', cause: 'furtivo', createdAt: '2026-10-29T12:00:00.000Z', ...patch
});

describe('sanitizeAwarenessEntries', () => {
    it('mantém o par válido e descarta o que não serve (sem campos, causa desconhecida, não objeto)', () => {
        const result = sanitizeAwarenessEntries([ entry(), { ...entry({ id: 'u2' }), cause: 'magia' }, { id: 'u3' }, null, 'x', { ...entry({ id: 'u4' }), hiderId: '' } ]);
        expect(result.map(item => item.id)).toEqual([ 'u1' ]);
    });

    it('não é lista: vazio', () => {
        expect(sanitizeAwarenessEntries(undefined)).toEqual([]);
        expect(sanitizeAwarenessEntries({ 0: entry() })).toEqual([]);
    });

    it('guarda no máximo os 60 mais novos', () => {
        const many = Array.from({ length: 70 }, (_, index) => entry({ id: `u${index}`, observerId: `o${index}` }));
        const result = sanitizeAwarenessEntries(many);
        expect(result).toHaveLength(60);
        expect(result[0]?.id).toBe('u10');
    });

    it('nomes e horário ausentes viram texto vazio, sem quebrar', () => {
        const result = sanitizeAwarenessEntries([ { id: 'u1', hiderId: 'a', observerId: 'b', cause: 'outro' } ]);
        expect(result[0]).toMatchObject({ hiderName: '', observerName: '', createdAt: '' });
    });
});

describe('awarenessFromDocs', () => {
    it('acha o documento da matriz entre os de gmData, e limpa os pares', () => {
        const docs = [
            { id: 'creature-defenses:goblin', data: { kind: 'creatureDefenses' } },
            { id: 'awareness', data: { kind: 'awareness', entries: [ entry(), { id: 'ruim' } ] } }
        ];
        expect(awarenessFromDocs(docs)?.map(item => item.id)).toEqual([ 'u1' ]);
    });

    it('sem o documento devolve null (matriz vazia não tem documento)', () => {
        expect(awarenessFromDocs([])).toBeNull();
        expect(awarenessFromDocs([ { id: 'awareness', data: { kind: 'outro' } } ])).toBeNull();
    });
});

describe('resolveUnseen', () => {
    it('o documento privado vale, mesmo contra uma matriz antiga no combate', () => {
        expect(resolveUnseen([ entry({ id: 'novo' }) ], [ entry({ id: 'velho' }) ]).map(item => item.id)).toEqual([ 'novo' ]);
    });

    it('documento vazio vale vazio (não ressuscita a matriz antiga)', () => {
        expect(resolveUnseen([], [ entry() ])).toEqual([]);
    });

    it('sem documento vale a matriz antiga do combate, limpa; sem nada, vazio', () => {
        expect(resolveUnseen(null, [ entry(), { id: 'x' } as unknown as UnseenData ]).map(item => item.id)).toEqual([ 'u1' ]);
        expect(resolveUnseen(null, undefined)).toEqual([]);
        expect(resolveUnseen(undefined, undefined)).toEqual([]);
    });
});

describe('attachAwareness', () => {
    it('põe a matriz do documento no combate sem mexer no resto', () => {
        const combat: { round: number; unseen?: UnseenData[] } = { round: 3, unseen: [ entry({ id: 'velho' }) ] };
        const attached = attachAwareness(combat, [ entry({ id: 'novo' }) ]);
        expect(attached.round).toBe(3);
        expect(attached.unseen?.map(item => item.id)).toEqual([ 'novo' ]);
        expect(combat.unseen?.[0]?.id).toBe('velho');
    });

    it('sem documento devolve o mesmo combate (estável para o React)', () => {
        const combat = { round: 3 };
        expect(attachAwareness(combat, null)).toBe(combat);
    });
});

describe('o que o não-mestre vê', () => {
    it('combatWithoutUnseen tira a matriz e devolve o mesmo objeto quando não há', () => {
        const combat = { round: 1, unseen: [ entry() ] };
        const stripped = combatWithoutUnseen(combat);
        expect(stripped).toEqual({ round: 1 });
        expect('unseen' in stripped).toBe(false);

        const clean = { round: 1 };
        expect(combatWithoutUnseen(clean)).toBe(clean);
    });

    it('campaignWithoutUnseen tira só a matriz do combate da campanha', () => {
        const campaign = { id: 'c1', session: { users: [ 'a' ], combat: { round: 2, unseen: [ entry() ], pendingAttacks: [] } } };
        const stripped = campaignWithoutUnseen(campaign);
        expect(stripped.session.combat).toEqual({ round: 2, pendingAttacks: [] });
        expect(stripped.session.users).toEqual([ 'a' ]);
        expect(campaign.session.combat.unseen).toHaveLength(1);
    });

    it('campanha sem combate ou sem matriz volta a mesma', () => {
        const noCombat = { id: 'c1', session: { users: [] } };
        expect(campaignWithoutUnseen(noCombat)).toBe(noCombat);
        const clean = { id: 'c1', session: { combat: { round: 1 } } };
        expect(campaignWithoutUnseen(clean)).toBe(clean);
        const noSession = { id: 'c1' };
        expect(campaignWithoutUnseen(noSession)).toBe(noSession);
    });
});

describe('hiddenNoticesByUser', () => {
    const combatants = [
        { id: 'aria', type: 'player' as const, odacId: 'u-ana' },
        { id: 'borin', type: 'player' as const, odacId: 'u-bia' },
        { id: 'goblin-1', type: 'creature' as const }
    ];

    it('cada jogador escondido sabe de quem está fora da vista, e só ele', () => {
        const entries = [
            entry({ id: 'u1', hiderId: 'aria', observerId: 'goblin-1', observerName: 'Goblin' }),
            entry({ id: 'u2', hiderId: 'aria', observerId: 'borin', observerName: 'Borin', cause: 'invisivel' }),
            entry({ id: 'u3', hiderId: 'borin', observerId: 'goblin-1', observerName: 'Goblin', cause: 'outro' })
        ];
        const notices = hiddenNoticesByUser(combatants, entries);

        expect(notices.get('u-ana')).toEqual([
            { hiderId: 'aria', observerName: 'Goblin', cause: 'furtivo' },
            { hiderId: 'aria', observerName: 'Borin', cause: 'invisivel' }
        ]);
        expect(notices.get('u-bia')).toEqual([ { hiderId: 'borin', observerName: 'Goblin', cause: 'outro' } ]);
        expect(notices.size).toBe(2);
    });

    it('criatura escondida não tem jogador a avisar, e quem não vê não recebe nada', () => {
        const entries = [ entry({ hiderId: 'goblin-1', hiderName: 'Goblin', observerId: 'aria', observerName: 'Aria' }) ];
        expect(hiddenNoticesByUser(combatants, entries).size).toBe(0);
    });

    it('jogador sem dono (sem odacId) ou que saiu do combate não gera aviso', () => {
        expect(hiddenNoticesByUser([ { id: 'aria', type: 'player' } ], [ entry() ]).size).toBe(0);
        expect(hiddenNoticesByUser([], [ entry() ]).size).toBe(0);
        expect(hiddenNoticesByUser(undefined, undefined).size).toBe(0);
    });
});

describe('sanitizeHiddenNotices', () => {
    it('limpa os avisos do documento do jogador', () => {
        expect(sanitizeHiddenNotices([ { hiderId: 'aria', observerName: 'Goblin', cause: 'furtivo' }, { hiderId: 'x', cause: 'magia' }, 'lixo' ]))
            .toEqual([ { hiderId: 'aria', observerName: 'Goblin', cause: 'furtivo' } ]);
        expect(sanitizeHiddenNotices(undefined)).toEqual([]);
    });
});

describe('sameUnseen', () => {
    it('compara o conteúdo, e vazio é igual a ausente', () => {
        expect(sameUnseen([ entry() ], [ entry() ])).toBe(true);
        expect(sameUnseen([ entry() ], [ entry({ cause: 'outro' }) ])).toBe(false);
        expect(sameUnseen(undefined, [])).toBe(true);
    });
});
