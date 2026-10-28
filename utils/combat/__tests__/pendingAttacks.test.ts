import {
    addPendingAttack,
    buildAttackLogMessage,
    dropPendingFor,
    findAwaitingDamage,
    MAX_PENDING_ATTACKS,
    removePendingAttack,
    sanitizeAttackDeclaration,
    sanitizeExplainLines,
    setPendingDamage,
    totalWithExtraDice,
    type PendingAttackData
} from '../pendingAttacks';

const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
    id: 'a1', attackerId: 'aria', attackerName: 'Aria', targetId: 'goblin', targetName: 'Goblin', source: 'weapon', name: 'Espada', kind: 'fisico',
    attackType: 'Cortante', attackTotal: 17, rolls: [ 12, 9 ], bonus: 5, createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

describe('sanitizeAttackDeclaration', () => {
    const valid = { source: 'weapon', name: 'Espada', kind: 'fisico', attackType: 'Cortante', attackTotal: 17, rolls: [ 12, 9 ], bonus: 5 };

    it('aceita uma declaração completa', () => {
        expect(sanitizeAttackDeclaration(valid)).toEqual({ source: 'weapon', name: 'Espada', kind: 'fisico', attackType: 'Cortante', attackTotal: 17, rolls: [ 12, 9 ], bonus: 5 });
    });

    it('natureza e origem desconhecidas caem no padrão da origem', () => {
        expect(sanitizeAttackDeclaration({ ...valid, kind: 'xyz', source: 'weapon' })?.kind).toBe('fisico');
        expect(sanitizeAttackDeclaration({ ...valid, kind: 'xyz', source: 'spell' })?.kind).toBe('magico');
        expect(sanitizeAttackDeclaration({ ...valid, source: 'tiro' })?.source).toBe('weapon');
    });

    it('guarda crítico e área só quando valem', () => {
        expect(sanitizeAttackDeclaration({ ...valid, critical: true, areaMeters: 6 })).toMatchObject({ critical: true, areaMeters: 6 });
        const plain = sanitizeAttackDeclaration({ ...valid, critical: false, areaMeters: 0 });
        expect(plain).not.toHaveProperty('critical');
        expect(plain).not.toHaveProperty('areaMeters');
    });

    it('ataque manual do mestre pode vir sem os d20', () => {
        expect(sanitizeAttackDeclaration({ source: 'manual', name: 'Mordida', attackTotal: 14 })).toMatchObject({ rolls: [], bonus: 0, attackTotal: 14 });
    });

    it.each([
        [ 'sem nome', { ...valid, name: '  ' } ],
        [ 'total não inteiro', { ...valid, attackTotal: 17.5 } ],
        [ 'total como texto', { ...valid, attackTotal: '17' } ],
        [ 'total absurdo', { ...valid, attackTotal: 5000 } ],
        [ 'd20 fora de 1 a 20', { ...valid, rolls: [ 25 ] } ],
        [ 'd20 que não é número', { ...valid, rolls: [ 'a' ] } ],
        [ 'bônus absurdo', { ...valid, bonus: 99999 } ],
        [ 'não é objeto', 'ataque' ]
    ])('recusa %s', (_nome, raw) => {
        expect(sanitizeAttackDeclaration(raw)).toBeNull();
    });

    it('corta nome e tipo longos e limita os d20', () => {
        const long = sanitizeAttackDeclaration({ ...valid, name: 'x'.repeat(200), attackType: 'y'.repeat(100), rolls: Array.from({ length: 30 }, () => 10) });
        expect(long?.name).toHaveLength(80);
        expect(long?.attackType).toHaveLength(40);
        expect(long?.rolls).toHaveLength(10);
    });
});

describe('lista de ataques pendentes', () => {
    it('declarar de novo antes do dano troca o ataque anterior do mesmo atacante e da mesma arma', () => {
        const list = addPendingAttack([ attack({ id: 'a1' }) ], attack({ id: 'a2', attackTotal: 20 }));
        expect(list.map(entry => entry.id)).toEqual([ 'a2' ]);
    });

    it('ataque que já tem dano fica, e outra arma ou outro atacante não trocam nada', () => {
        const withDamage = attack({ id: 'a1', damageRolled: 9 });
        expect(addPendingAttack([ withDamage ], attack({ id: 'a2' })).map(entry => entry.id)).toEqual([ 'a1', 'a2' ]);
        expect(addPendingAttack([ attack({ id: 'a1' }) ], attack({ id: 'a2', name: 'Adaga' })).map(entry => entry.id)).toEqual([ 'a1', 'a2' ]);
        expect(addPendingAttack([ attack({ id: 'a1' }) ], attack({ id: 'a2', attackerId: 'caio' })).map(entry => entry.id)).toEqual([ 'a1', 'a2' ]);
    });

    it('guarda no máximo os 20 mais novos', () => {
        let list: PendingAttackData[] = [];
        for (let index = 0; index < MAX_PENDING_ATTACKS + 5; index++) list = addPendingAttack(list, attack({ id: `a${index}`, name: `Arma ${index}` }));
        expect(list).toHaveLength(MAX_PENDING_ATTACKS);
        expect(list[0]?.id).toBe('a5');
    });

    it('acha o ataque que espera o dano (o mais novo) e registra o dano nele', () => {
        const list = [ attack({ id: 'velho', damageRolled: 4 }), attack({ id: 'novo' }) ];
        expect(findAwaitingDamage(list, 'aria', 'Espada')?.id).toBe('novo');
        expect(findAwaitingDamage(list, 'aria', 'Adaga')).toBeUndefined();

        const updated = setPendingDamage(list, 'novo', 9, true);
        expect(updated?.find(entry => entry.id === 'novo')).toMatchObject({ damageRolled: 9, critical: true });
        expect(setPendingDamage(list, 'nada', 9)).toBeNull();
        expect(findAwaitingDamage(updated!, 'aria', 'Espada')).toBeUndefined();
    });

    it('remove um ataque, e os de quem saiu do combate', () => {
        const list = [ attack({ id: 'a1' }), attack({ id: 'a2', attackerId: 'caio' }), attack({ id: 'a3', targetId: 'caio' }) ];
        expect(removePendingAttack(list, 'a2').map(entry => entry.id)).toEqual([ 'a1', 'a3' ]);
        expect(dropPendingFor(list, 'caio').map(entry => entry.id)).toEqual([ 'a1' ]);
        expect(removePendingAttack(undefined, 'a1')).toEqual([]);
    });
});

describe('totalWithExtraDice', () => {
    it('sem dado extra o total é o declarado', () => {
        expect(totalWithExtraDice(attack())).toBe(17);
    });

    it('um d20 extra que sai maior vira o dado que vale (vantagem)', () => {
        expect(totalWithExtraDice(attack(), [ 18 ])).toBe(23);
        expect(totalWithExtraDice(attack(), [ 3 ])).toBe(17);
    });

    it('ataque sem d20 (manual) mantém o total, mesmo com dado extra solto', () => {
        expect(totalWithExtraDice(attack({ rolls: [], bonus: 0, attackTotal: 14 }))).toBe(14);
        expect(totalWithExtraDice(attack({ rolls: [], bonus: 0, attackTotal: 14 }), [ 20 ])).toBe(14);
    });
});

describe('linhas públicas e mensagem do combate', () => {
    it('só as linhas "all" saem, com texto limitado e até 12', () => {
        const lines = sanitizeExplainLines([
            { label: 'Acerto', detail: '18 contra AP 15: acertou', visibility: 'all' },
            { label: 'Fraqueza do alvo', detail: '×2', visibility: 'gm' },
            { label: '', visibility: 'all' },
            { label: 'x'.repeat(200), detail: 'y'.repeat(500), visibility: 'all' },
            'lixo'
        ]);

        expect(lines).toHaveLength(2);
        expect(lines[0]).toEqual({ label: 'Acerto', detail: '18 contra AP 15: acertou', visibility: 'all' });
        expect(lines[1]?.label).toHaveLength(80);
        expect(lines[1]?.detail).toHaveLength(200);
        expect(sanitizeExplainLines(Array.from({ length: 30 }, () => ({ label: 'l', visibility: 'all' })))).toHaveLength(12);
        expect(sanitizeExplainLines(undefined)).toEqual([]);
    });

    it('a mensagem diz quem atacou quem e traz as linhas, sem vida restante', () => {
        const lines = sanitizeExplainLines([ { label: 'Acerto', detail: '18 contra AP 15: acertou', visibility: 'all' }, { label: 'Dano final', detail: '9', visibility: 'all' } ]);
        const message = buildAttackLogMessage(attack(), true, 9, lines);

        expect(message).toBe('⚔️ **Aria** atacou **Goblin** com **Espada**: 9 de dano.\n• Acerto: 18 contra AP 15: acertou\n• Dano final: 9');
        expect(buildAttackLogMessage(attack(), false, 0, [])).toBe('⚔️ **Aria** atacou **Goblin** com **Espada**: errou.');
        expect(buildAttackLogMessage(attack(), true, 0, [])).toBe('⚔️ **Aria** atacou **Goblin** com **Espada**: sem dano.');
    });
});
