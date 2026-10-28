import {
    addPendingAttack,
    buildAttackLogMessage,
    defenseSkillFor,
    describeDefense,
    dropPendingFor,
    findAwaitingDamage,
    incomingAttacks,
    MAX_PENDING_ATTACKS,
    removePendingAttack,
    sanitizeAttackDeclaration,
    sanitizeDefenseDeclaration,
    sanitizeExplainLines,
    setPendingDamage,
    setPendingDefense,
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
        expect(findAwaitingDamage(list, 'aria', 'Espada', 'weapon')?.id).toBe('novo');
        expect(findAwaitingDamage(list, 'aria', 'Espada', 'spell')).toBeUndefined();

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

describe('defesa do jogador atacado', () => {
    const dodge = { choice: 'dodge', skill: 'Reflexos', total: 18, rolls: [ 15, 9 ], used: 15, bonus: 3 };

    it('aceita a esquiva e a resistência com o teste rolado', () => {
        expect(sanitizeDefenseDeclaration(dodge)).toEqual(dodge);
        expect(sanitizeDefenseDeclaration({ ...dodge, choice: 'resist', skill: 'RES Mental' })).toMatchObject({ choice: 'resist', skill: 'RES Mental' });
    });

    it('"não me defender" não leva teste, mesmo que venha lixo junto', () => {
        expect(sanitizeDefenseDeclaration({ choice: 'none', total: 99, skill: 'Reflexos' })).toEqual({ choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 });
    });

    it('recusa escolha desconhecida, perícia que não é da defesa e corpo que não é objeto', () => {
        expect(sanitizeDefenseDeclaration({ ...dodge, choice: 'parry' })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, skill: 'Atletismo' })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, skill: 'RES Física' })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, choice: 'resist' })).toBeNull();
        expect(sanitizeDefenseDeclaration(null)).toBeNull();
        expect(sanitizeDefenseDeclaration('dodge')).toBeNull();
    });

    it('o total tem de fechar com o d20 que valeu mais o bônus, e o d20 que valeu tem de ter sido rolado', () => {
        expect(sanitizeDefenseDeclaration({ ...dodge, total: 30 })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, used: 12, total: 15 })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, rolls: [] })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, rolls: [ 15, 21 ] })).toBeNull();
        expect(sanitizeDefenseDeclaration({ ...dodge, total: 18.5 })).toBeNull();
    });

    it('guarda a defesa no ataque certo, e devolve null se o ataque não existe', () => {
        const list = [ attack({ id: 'a1' }), attack({ id: 'a2' }) ];
        const updated = setPendingDefense(list, 'a2', { choice: 'dodge', skill: 'Reflexos', total: 18, rolls: [ 15 ], used: 15, bonus: 3 });

        expect(updated?.find(entry => entry.id === 'a2')?.defense?.total).toBe(18);
        expect(updated?.find(entry => entry.id === 'a1')?.defense).toBeUndefined();
        expect(setPendingDefense(list, 'a9', { choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 })).toBeNull();
        expect(setPendingDefense(undefined, 'a1', { choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 })).toBeNull();
    });

    it('separa os ataques ao alvo entre os que esperam a defesa e os que ele já respondeu', () => {
        const answered = attack({ id: 'a2', targetId: 'caio', defense: { choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 } });
        const list = [ attack({ id: 'a1', targetId: 'caio' }), answered, attack({ id: 'a3', targetId: 'goblin' }) ];

        const { awaiting, answered: done } = incomingAttacks(list, 'caio');
        expect(awaiting.map(entry => entry.id)).toEqual([ 'a1' ]);
        expect(done.map(entry => entry.id)).toEqual([ 'a2' ]);
        expect(incomingAttacks(list, undefined)).toEqual({ awaiting: [], answered: [] });
        expect(incomingAttacks(undefined, 'caio')).toEqual({ awaiting: [], answered: [] });
    });

    it('a perícia da defesa: Reflexos na esquiva e a RES da natureza na resistência (magia Psíquica é mental)', () => {
        expect(defenseSkillFor({ kind: 'fisico', attackType: 'Cortante' }, 'dodge')).toBe('Reflexos');
        expect(defenseSkillFor({ kind: 'fisico', attackType: 'Cortante' }, 'resist')).toBe('RES Física');
        expect(defenseSkillFor({ kind: 'magico', attackType: 'FOGO' }, 'resist')).toBe('RES Mágica');
        expect(defenseSkillFor({ kind: 'magico', attackType: 'PSÍQUICO' }, 'resist')).toBe('RES Mental');
        expect(defenseSkillFor({ kind: 'mental' }, 'resist')).toBe('RES Mental');
    });

    it('descreve o teste como o mestre vai ler', () => {
        expect(describeDefense({ choice: 'dodge', skill: 'Reflexos', total: 18, rolls: [ 15, 9 ], used: 15, bonus: 3 })).toBe('Reflexos: [15, 9: 15] + 3 = 18');
        expect(describeDefense({ choice: 'resist', skill: 'RES Física', total: 7, rolls: [ 9 ], used: 9, bonus: -2 })).toBe('RES Física: [9] − 2 = 7');
        expect(describeDefense({ choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 })).toBe('sem defesa');
    });
});
