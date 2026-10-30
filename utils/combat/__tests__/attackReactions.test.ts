import {
    canApply, counterOf, describeCounter, describeReaction, isArmedWhen, planAttackReaction, reactionAdjustments, reactionOptionsFor, reducedDamage, settleReactions, whenMet, whenList,
    buildAttackReaction, MAX_ATTACK_REACTIONS, type AttackReaction
} from '../attackReactions';
import { findPassiveByKey, NO_USES, type PassiveDef } from '../passives';

const def = (key: string): PassiveDef => {
    const found = findPassiveByKey(key);
    if (!found) throw new Error(`habilidade ${key} fora do catálogo`);
    return found;
};

const BARREIRA = 'subclass:barreira de ki';
const METAMORFOSE = 'subclass:metamorfose adaptativa';
const RESPOSTA = 'subclass:resposta tatica';
const REFLEXOS = 'subclass:reflexos taticos';
const XEQUE = 'subclass:xeque-mate';

const reaction = (key: string, patch: Partial<AttackReaction> = {}): AttackReaction => {
    const built = buildAttackReaction(def(key), { id: 'aria', name: 'Aria' }, `r-${key}`, '2026-10-30T12:00:00.000Z');
    if (!built) throw new Error('não é reação');
    return { ...built, ...patch };
};

describe('o catálogo das reações', () => {
    it('as cinco habilidades são ativadas, de Reação, com uma reação a ataque', () => {
        for (const key of [ BARREIRA, METAMORFOSE, RESPOSTA, REFLEXOS, XEQUE ]) {
            const found = def(key);
            expect(found.mode).toBe('ativada');
            expect(found.activation?.execution).toBe('Reação');
            expect(found.activation?.reaction).toBeDefined();
        }
    });

    it('Barreira de Ki: 8 MP, +10 de AP, imediata', () => {
        const barreira = def(BARREIRA);
        expect(barreira.activation?.cost?.mp).toBe(8);
        expect(whenList(barreira.activation!.reaction!)).toEqual([ 'now' ]);
        expect(barreira.activation!.reaction!.effects).toContainEqual({ kind: 'apBonus', value: 10 });
    });

    it('Metamorfose Adaptativa: 3 MP, 3 por combate, reduz o dano em 50% e só se paga se houver dano', () => {
        const metamorfose = def(METAMORFOSE);
        expect(metamorfose.activation?.cost?.mp).toBe(3);
        expect(metamorfose.activation?.limits).toEqual([ { per: 'combate', max: 3 } ]);
        expect(metamorfose.activation!.reaction!.effects).toEqual([ { kind: 'damagePct', pct: 50 } ]);
        expect(isArmedWhen(whenList(metamorfose.activation!.reaction!))).toBe(true);
    });

    it('Xeque-Mate: 20 MP, 1 por dia, o ataque erra, contra-ataque crítico com +6d6 e choque', () => {
        const xeque = def(XEQUE);
        expect(xeque.activation?.cost?.mp).toBe(20);
        expect(xeque.activation?.limits).toEqual([ { per: 'dia', max: 1 } ]);
        const effects = xeque.activation!.reaction!.effects;
        expect(effects).toContainEqual({ kind: 'autoMiss' });
        const counter = effects.find(effect => effect.kind === 'counter');
        expect(counter).toMatchObject({ counter: { guaranteedCrit: true, extraDice: '6d6', meleeOnly: false } });
        expect(counter && counter.kind === 'counter' ? counter.counter.onHit?.modifiers : []).toEqual([
            { kind: 'disadvantage', target: 'attack' },
            { kind: 'disadvantage', target: 'resistance' }
        ]);
    });

    it('Resposta Tática: +5 no acerto, só se um ataque corpo a corpo errar, sem custo de MP nem limite próprio (a Reação é o limite)', () => {
        const resposta = def(RESPOSTA);
        expect(resposta.activation?.cost).toBeUndefined();
        expect(resposta.activation?.limits).toBeUndefined();
        expect(whenList(resposta.activation!.reaction!)).toEqual([ 'missMelee' ]);
        expect(counterOf(reaction(RESPOSTA))).toMatchObject({ hitBonus: 5, meleeOnly: true, abilityKey: RESPOSTA, source: 'Resposta Tática' });
    });

    it('Reflexos Táticos: 1 por combate, contra-ataque quando a esquiva anula o dano ou quando leva dano corpo a corpo sem esquivar', () => {
        const reflexos = def(REFLEXOS);
        expect(reflexos.activation?.limits).toEqual([ { per: 'combate', max: 1 } ]);
        expect(whenList(reflexos.activation!.reaction!)).toEqual([ 'dodged', 'damagedMeleeNoDodge' ]);
    });

    it('uma habilidade ativada comum não é reação', () => {
        expect(def('class:cura interior').activation?.reaction).toBeUndefined();
    });
});

describe('quando a reação pode valer', () => {
    it('contra ataque que não é corpo a corpo, Resposta Tática não se aplica; Barreira e Reflexos sim', () => {
        expect(canApply(def(RESPOSTA).activation!.reaction!, {})).toBe(false);
        expect(canApply(def(RESPOSTA).activation!.reaction!, { melee: false })).toBe(false);
        expect(canApply(def(RESPOSTA).activation!.reaction!, { melee: true })).toBe(true);
        expect(canApply(def(BARREIRA).activation!.reaction!, {})).toBe(true);
        expect(canApply(def(REFLEXOS).activation!.reaction!, {})).toBe(true);
    });
});

describe('planAttackReaction', () => {
    const plan = (key: string, patch: Partial<Parameters<typeof planAttackReaction>[0]> = {}) =>
        planAttackReaction({ key, attack: { melee: true }, currentMp: 30, uses: NO_USES, owned: true, ...patch });

    it('libera quando tem a habilidade, o MP e o ataque combina', () => {
        expect(plan(BARREIRA)).toMatchObject({ ok: true, cost: 8 });
        expect(plan(RESPOSTA)).toMatchObject({ ok: true, cost: 0 });
    });

    it('recusa quem não tem a habilidade', () => {
        expect(plan(BARREIRA, { owned: false })).toMatchObject({ ok: false, block: 'sem-habilidade' });
    });

    it('recusa habilidade que não é reação a ataque', () => {
        expect(plan('class:cura interior')).toMatchObject({ ok: false, block: 'nao-e-reacao' });
    });

    it('recusa sem MP', () => {
        expect(plan(BARREIRA, { currentMp: 7 })).toMatchObject({ ok: false, block: 'sem-mp' });
        expect(plan(BARREIRA, { currentMp: 8 }).ok).toBe(true);
    });

    it('recusa quando os usos acabaram, e o mestre libera', () => {
        const spent = { day: { 'subclass-xeque-mate': 1 }, combat: {} };
        expect(plan(XEQUE, { uses: spent })).toMatchObject({ ok: false, block: 'limite' });
        expect(plan(XEQUE, { uses: spent, ignoreLimits: true }).ok).toBe(true);
        const combatSpent = { day: {}, combat: { 'subclass-metamorfose-adaptativa': 3 } };
        expect(plan(METAMORFOSE, { uses: combatSpent })).toMatchObject({ ok: false, block: 'limite' });
    });

    it('não reage duas vezes ao mesmo ataque com a mesma habilidade', () => {
        expect(plan(BARREIRA, { attack: { reactions: [ reaction(BARREIRA) ] } })).toMatchObject({ ok: false, block: 'ja-reagiu' });
    });

    it('tem um máximo de reações por ataque', () => {
        const many = [ BARREIRA, METAMORFOSE, REFLEXOS ].map(key => reaction(key));
        expect(many).toHaveLength(MAX_ATTACK_REACTIONS);
        expect(plan(XEQUE, { attack: { reactions: many } })).toMatchObject({ ok: false, block: 'muitas-reacoes' });
    });

    it('Resposta Tática contra ataque que não é corpo a corpo não se aplica', () => {
        expect(plan(RESPOSTA, { attack: {} })).toMatchObject({ ok: false, block: 'nao-se-aplica' });
    });
});

describe('buildAttackReaction', () => {
    it('copia os efeitos do catálogo (não aponta para o mesmo objeto) e marca a armada', () => {
        const built = reaction(METAMORFOSE);
        expect(built).toMatchObject({ key: METAMORFOSE, name: 'Metamorfose Adaptativa', by: 'aria', byName: 'Aria', armed: true, when: [ 'damaged' ] });
        built.effects.push({ kind: 'autoMiss' });
        expect(def(METAMORFOSE).activation!.reaction!.effects).toHaveLength(1);
    });

    it('a imediata não é armada', () => {
        expect(reaction(BARREIRA).armed).toBe(false);
        expect(reaction(XEQUE).armed).toBe(false);
    });

    it('devolve null para habilidade que não é reação', () => {
        expect(buildAttackReaction(def('class:cura interior'), { id: 'a', name: 'A' }, 'x', 'agora')).toBeNull();
    });
});

describe('reactionAdjustments (a proposta do mestre)', () => {
    it('Barreira de Ki soma o AP e deixa o lembrete do empurrão só para o mestre', () => {
        const adjustments = reactionAdjustments([ reaction(BARREIRA) ]);
        expect(adjustments).toMatchObject({ apBonus: 10, damagePct: 0, autoMiss: false });
        expect(adjustments.sources).toEqual([ { name: 'Barreira de Ki', text: '+10 de AP contra este ataque' } ]);
        expect(adjustments.notes[0]?.text).toContain('empurrado 3 m');
    });

    it('Metamorfose reduz o dano em 50% e Xeque-Mate faz o ataque errar', () => {
        expect(reactionAdjustments([ reaction(METAMORFOSE) ]).damagePct).toBe(50);
        expect(reactionAdjustments([ reaction(XEQUE) ])).toMatchObject({ autoMiss: true, apBonus: 0 });
    });

    it('a redução soma entre reações e nunca passa de 100%', () => {
        const twice = [ reaction(METAMORFOSE), reaction(METAMORFOSE, { id: 'outra' }), reaction(METAMORFOSE, { id: 'terceira' }) ];
        expect(reactionAdjustments(twice).damagePct).toBe(100);
    });

    it('reação armada de outra condição não mexe no cálculo (só abre o contra-ataque na resolução)', () => {
        expect(reactionAdjustments([ reaction(RESPOSTA), reaction(REFLEXOS) ])).toMatchObject({ apBonus: 0, damagePct: 0, autoMiss: false });
    });

    it('sem reações não muda nada', () => {
        expect(reactionAdjustments(undefined)).toEqual({ apBonus: 0, damagePct: 0, autoMiss: false, sources: [], notes: [] });
    });
});

describe('reducedDamage', () => {
    it('arredonda para baixo e nunca fica abaixo de zero', () => {
        expect(reducedDamage(9, 50)).toBe(4);
        expect(reducedDamage(10, 50)).toBe(5);
        expect(reducedDamage(10, 100)).toBe(0);
        expect(reducedDamage(10, 150)).toBe(0);
        expect(reducedDamage(10, 0)).toBe(10);
    });
});

describe('whenMet / settleReactions (a resolução)', () => {
    it('miss: o ataque errou', () => {
        expect(whenMet('miss', { hit: false, dealt: 0 })).toBe(true);
        expect(whenMet('miss', { hit: true, dealt: 5 })).toBe(false);
    });

    it('missMelee: errou e era corpo a corpo', () => {
        expect(whenMet('missMelee', { hit: false, dealt: 0, melee: true })).toBe(true);
        expect(whenMet('missMelee', { hit: false, dealt: 0, melee: false })).toBe(false);
        expect(whenMet('missMelee', { hit: false, dealt: 0 })).toBe(false);
        expect(whenMet('missMelee', { hit: true, dealt: 4, melee: true })).toBe(false);
    });

    it('damaged: o dano passou de zero', () => {
        expect(whenMet('damaged', { hit: true, dealt: 1 })).toBe(true);
        expect(whenMet('damaged', { hit: true, dealt: 0 })).toBe(false);
        expect(whenMet('damaged', { hit: false, dealt: 0 })).toBe(false);
    });

    it('dodged: a esquiva anulou um ataque que acertaria', () => {
        expect(whenMet('dodged', { hit: true, dealt: 0, defense: 'dodge' })).toBe(true);
        // esquivou e falhou: levou dano
        expect(whenMet('dodged', { hit: true, dealt: 6, defense: 'dodge' })).toBe(false);
        // o ataque errou o AP: não houve o que esquivar
        expect(whenMet('dodged', { hit: false, dealt: 0, defense: 'dodge' })).toBe(false);
        expect(whenMet('dodged', { hit: true, dealt: 0, defense: 'resist' })).toBe(false);
    });

    it('damagedMeleeNoDodge: dano corpo a corpo sem esquivar (não se defendeu ou resistiu)', () => {
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 6, melee: true, defense: 'none' })).toBe(true);
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 6, melee: true, defense: 'resist' })).toBe(true);
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 6, melee: true })).toBe(true);
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 6, melee: true, defense: 'dodge' })).toBe(false);
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 6, melee: false, defense: 'none' })).toBe(false);
        expect(whenMet('damagedMeleeNoDodge', { hit: true, dealt: 0, melee: true, defense: 'none' })).toBe(false);
    });

    it('as imediatas sempre valem e já foram pagas; as armadas só pagam se a condição se cumprir', () => {
        const reactions = [ reaction(BARREIRA), reaction(METAMORFOSE), reaction(RESPOSTA) ];

        const hitAndHurt = settleReactions(reactions, { hit: true, dealt: 8, melee: true, defense: 'none' });
        expect(hitAndHurt.map(entry => [ entry.reaction.name, entry.fires, entry.mustPay ])).toEqual([
            [ 'Barreira de Ki', true, false ],
            [ 'Metamorfose Adaptativa', true, true ],
            [ 'Resposta Tática', false, false ]
        ]);

        const missed = settleReactions(reactions, { hit: false, dealt: 0, melee: true, defense: 'none' });
        expect(missed.map(entry => [ entry.reaction.name, entry.fires, entry.mustPay ])).toEqual([
            [ 'Barreira de Ki', true, false ],
            [ 'Metamorfose Adaptativa', false, false ],
            [ 'Resposta Tática', true, true ]
        ]);
    });

    it('sem reações não há nada a liquidar', () => {
        expect(settleReactions(undefined, { hit: true, dealt: 3 })).toEqual([]);
    });

    it('Reflexos Táticos vale em qualquer uma das duas condições', () => {
        const reflexos = [ reaction(REFLEXOS) ];
        expect(settleReactions(reflexos, { hit: true, dealt: 0, defense: 'dodge', melee: true })[0]).toMatchObject({ fires: true, mustPay: true });
        expect(settleReactions(reflexos, { hit: true, dealt: 5, defense: 'none', melee: true })[0]).toMatchObject({ fires: true, mustPay: true });
        expect(settleReactions(reflexos, { hit: true, dealt: 5, defense: 'dodge', melee: true })[0]).toMatchObject({ fires: false });
    });
});

describe('counterOf / descrições', () => {
    it('só a reação com contra-ataque devolve um', () => {
        expect(counterOf(reaction(BARREIRA))).toBeNull();
        expect(counterOf(reaction(XEQUE))).toMatchObject({ guaranteedCrit: true, extraDice: '6d6', source: 'Xeque-Mate', abilityKey: XEQUE });
    });

    it('describeCounter e describeReaction ficam legíveis', () => {
        expect(describeCounter({ hitBonus: 5, meleeOnly: true })).toBe('+5 no acerto, corpo a corpo');
        expect(describeCounter({ guaranteedCrit: true, extraDice: '6d6', meleeOnly: false })).toBe('crítico garantido, +6d6 de dano, qualquer arma');
        expect(describeReaction(reaction(BARREIRA))).toBe('Barreira de Ki: +10 de AP');
        expect(describeReaction(reaction(METAMORFOSE))).toBe('Metamorfose Adaptativa: dano −50% (armada)');
        expect(describeReaction(reaction(RESPOSTA))).toContain('contra-ataque (+5 no acerto, corpo a corpo)');
    });
});

describe('reactionOptionsFor', () => {
    const passives = [ def(BARREIRA), def('class:cura interior'), def(RESPOSTA) ];

    it('lista só as habilidades de reação da ficha, com o motivo das que não dão', () => {
        const options = reactionOptionsFor(passives, {}, 5, NO_USES);
        expect(options.map(option => option.def.name)).toEqual([ 'Barreira de Ki', 'Resposta Tática' ]);
        expect(options[0]?.plan).toMatchObject({ ok: false, block: 'sem-mp' });
        expect(options[1]?.plan).toMatchObject({ ok: false, block: 'nao-se-aplica' });
    });

    it('marca a que já reagiu e libera as que dão', () => {
        const options = reactionOptionsFor(passives, { melee: true, reactions: [ reaction(BARREIRA) ] }, 30, NO_USES);
        expect(options[0]).toMatchObject({ reacted: true });
        expect(options[1]).toMatchObject({ reacted: false });
        expect(options[1]?.plan.ok).toBe(true);
        expect(options[1]?.hint).toContain('gasta a Reação');
    });

    it('a dica diz o custo e os usos que sobram', () => {
        const [ option ] = reactionOptionsFor([ def(METAMORFOSE) ], {}, 30, { day: {}, combat: { 'subclass-metamorfose-adaptativa': 1 } });
        expect(option?.hint).toContain('3 MP');
        expect(option?.hint).toContain('2 de 3 por combate');
    });
});
