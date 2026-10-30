import {
    castOptionList, castOptionsFor, findPassiveByKey, fixationRule, guidedBonusDice, guidedRule, invulnerableSpellName, isFixedSpell, nextGuided, planCast, quickCastApplies, quickCastUsed,
    readFixedSpell, twinCastAllows, twinCastRule, type CastPlanInput, type PassiveDef
} from '..';

const def = (key: string): PassiveDef => {
    const found = findPassiveByKey(key);
    if (!found) throw new Error(`habilidade ${key} fora do catálogo`);
    return found;
};

const INTENSIFICACAO = def('subclass:intensificacao magica');
const ESTAGIO_QUATRO = def('subclass:estagio quatro');
const RAPIDA = def('subclass:conjuracao rapida');
const TEIA = def('subclass:teia da realidade');
const FIXACAO = def('class:fixacao magica');
const GUIADA = def('class:magia guiada');

const spell = (level: number, execution = 'Padrão') => ({ level, execution });
const context = { sheet: { attributes: { foc: 10 } } };

const input = (patch: Partial<CastPlanInput> = {}): CastPlanInput => ({
    spell: spell(2), stage: 3, stageCount: 3, passives: [], context, selected: [], baseCost: 9, twin: 'none', quickCastReady: false, fixed: false, fixedAtMaxStage: false, guidedDice: 0, ...patch
});

describe('o catálogo das habilidades de conjuração', () => {
    it('as seis estão estruturadas como automáticas, com a regra certa', () => {
        for (const found of [ INTENSIFICACAO, ESTAGIO_QUATRO, RAPIDA, TEIA, FIXACAO, GUIADA ]) expect(found.mode).toBe('automatica');
        expect(INTENSIFICACAO.rules).toEqual([ expect.objectContaining({ kind: 'castOption', id: 'intensify', mp: 2, effect: { dice: [ '2d8' ] } }) ]);
        expect(ESTAGIO_QUATRO.rules).toEqual([ expect.objectContaining({ kind: 'castOption', id: 'stageFour', mp: 12, mpLevel4: 20, lastStageOnly: true, critMarginDelta: -2, effect: { dice: [ '3d10' ] } }) ]);
        expect(RAPIDA.rules).toEqual([ { kind: 'quickCast', maxLevel: 1 } ]);
        expect(TEIA.rules).toEqual([ { kind: 'twinCast', maxLevel: 2, extraMp: 1 } ]);
        expect(FIXACAO.rules).toEqual([ { kind: 'fixation', testDice: '1d6', maxStageDamage: 5 } ]);
        expect(GUIADA.rules).toEqual([ { kind: 'guidedHits', die: '1d4', maxHits: 3 } ]);
    });

    it('castOptionList lista as opções de metamagia da ficha, sem olhar para a magia', () => {
        expect(castOptionList([ INTENSIFICACAO, ESTAGIO_QUATRO, RAPIDA ]).map(option => [ option.id, option.mp, option.mpLevel4 ])).toEqual([ [ 'intensify', 2, undefined ], [ 'stageFour', 12, 20 ] ]);
        expect(castOptionList([ RAPIDA ])).toEqual([]);
    });
});

describe('castOptionsFor (o que vale nesta magia e neste estágio)', () => {
    it('Intensificação Mágica vale em qualquer estágio e nível, por 2 MP e +2d8', () => {
        const [ option ] = castOptionsFor([ INTENSIFICACAO ], spell(3), 1, 3, context);
        expect(option).toMatchObject({ id: 'intensify', extraMp: 2, available: true, critMarginReduction: 0 });
        expect(option?.spec).toMatchObject({ source: 'Intensificação Mágica', dice: [ '2d8' ], flat: 0 });
    });

    it('Estágio Quatro só vale no último estágio da magia e custa 12 MP (20 no nível 4)', () => {
        const early = castOptionsFor([ ESTAGIO_QUATRO ], spell(2), 2, 3, context)[0];
        expect(early).toMatchObject({ available: false });
        expect(early?.reason).toContain('último estágio');

        expect(castOptionsFor([ ESTAGIO_QUATRO ], spell(2), 3, 3, context)[0]).toMatchObject({ available: true, extraMp: 12, critMarginReduction: 2 });
        expect(castOptionsFor([ ESTAGIO_QUATRO ], spell(4), 3, 3, context)[0]).toMatchObject({ available: true, extraMp: 20 });
        // magia de 2 estágios: o último é o 2
        expect(castOptionsFor([ ESTAGIO_QUATRO ], spell(1), 2, 2, context)[0]?.available).toBe(true);
    });

    it('sem as habilidades não há opção', () => {
        expect(castOptionsFor([ RAPIDA, TEIA ], spell(1), 1, 3, context)).toEqual([]);
    });
});

describe('planCast', () => {
    it('conjuração comum: o custo do estágio, a ação da magia e nada mais', () => {
        const plan = planCast(input());
        expect(plan).toMatchObject({ cost: 9, execution: 'Padrão', quickCast: false, testDice: [], critMarginReduction: 0, effectSpecs: [], notes: [], applied: [] });
    });

    it('Intensificação Mágica ligada: +2 MP, +2d8 ao efetuar e a nota para o chat', () => {
        const plan = planCast(input({ passives: [ INTENSIFICACAO ], selected: [ 'intensify' ] }));
        expect(plan.cost).toBe(11);
        expect(plan.extraCosts).toEqual([ { source: 'Intensificação Mágica', mp: 2 } ]);
        expect(plan.effectSpecs).toEqual([ expect.objectContaining({ source: 'Intensificação Mágica', dice: [ '2d8' ] }) ]);
        expect(plan.applied).toEqual([ 'intensify' ]);
        expect(plan.notes).toContain('Intensificação Mágica: +2 MP, 2d8 ao efetuar');
    });

    it('ligada mas desligada pela magia (Estágio Quatro no estágio 1): não entra', () => {
        const plan = planCast(input({ passives: [ ESTAGIO_QUATRO ], selected: [ 'stageFour' ], stage: 1 }));
        expect(plan).toMatchObject({ cost: 9, applied: [], effectSpecs: [], critMarginReduction: 0 });
        // a frase diz por que não valeu, para o jogador não achar que pagou
        expect(plan.notes).toEqual([ 'Estágio Quatro: só vale no último estágio da magia (não foi aplicada)' ]);
    });

    it('Estágio Quatro: +12 MP, +3d10, margem de crítico 18 e o lembrete do mestre', () => {
        const plan = planCast(input({ passives: [ ESTAGIO_QUATRO ], selected: [ 'stageFour' ] }));
        expect(plan.cost).toBe(21);
        expect(plan.critMarginReduction).toBe(2);
        expect(plan.effectSpecs[0]).toMatchObject({ dice: [ '3d10' ] });
        expect(plan.notes.some(note => note.includes('área dobrada'))).toBe(true);
    });

    it('as duas opções somam: 9 + 2 + 12 = 23, com as duas rolagens extras', () => {
        const plan = planCast(input({ passives: [ INTENSIFICACAO, ESTAGIO_QUATRO ], selected: [ 'intensify', 'stageFour' ] }));
        expect(plan.cost).toBe(23);
        expect(plan.effectSpecs.map(spec => spec.dice[0])).toEqual([ '2d8', '3d10' ]);
    });

    it('Estágio Quatro em magia de nível 4 custa 20', () => {
        expect(planCast(input({ spell: spell(4), passives: [ ESTAGIO_QUATRO ], selected: [ 'stageFour' ], baseCost: 15 })).cost).toBe(35);
    });

    it('Conjuração Rápida: magia de nível 1 Padrão ou Completa vira Bônus e marca o uso; só com a Bônus livre', () => {
        expect(planCast(input({ spell: spell(1), passives: [ RAPIDA ], quickCastReady: true }))).toMatchObject({ execution: 'Bônus', quickCast: true });
        expect(planCast(input({ spell: spell(1, 'Completa'), passives: [ RAPIDA ], quickCastReady: true }))).toMatchObject({ execution: 'Bônus', quickCast: true });
        // já usada ou sem Bônus
        expect(planCast(input({ spell: spell(1), passives: [ RAPIDA ], quickCastReady: false }))).toMatchObject({ execution: 'Padrão', quickCast: false });
        // nível 2 não entra, Reação e Movimento não mudam
        expect(planCast(input({ spell: spell(2), passives: [ RAPIDA ], quickCastReady: true })).execution).toBe('Padrão');
        expect(planCast(input({ spell: spell(1, 'Reação'), passives: [ RAPIDA ], quickCastReady: true })).execution).toBe('Reação');
        expect(planCast(input({ spell: spell(1, 'Movimento'), passives: [ RAPIDA ], quickCastReady: true })).execution).toBe('Movimento');
    });

    it('Teia da Realidade: a primeira paga +1 MP e gasta a ação; a segunda paga +1 MP e não gasta ação', () => {
        const first = planCast(input({ spell: spell(2), passives: [ TEIA ], twin: 'first' }));
        expect(first).toMatchObject({ cost: 10, execution: 'Padrão' });
        const second = planCast(input({ spell: spell(1), passives: [ TEIA ], twin: 'second' }));
        expect(second).toMatchObject({ cost: 10, execution: null });
        expect(second.notes[0]).toContain('segunda magia do par');
    });

    it('Teia da Realidade não vale em magia de nível 3 (nem cobra o +1)', () => {
        expect(planCast(input({ spell: spell(3), passives: [ TEIA ], twin: 'first' }))).toMatchObject({ cost: 9, execution: 'Padrão' });
    });

    it('a segunda magia do par, de nível 1, com Conjuração Rápida: continua sem ação (o par não gasta nem a Bônus)', () => {
        expect(planCast(input({ spell: spell(1), passives: [ TEIA, RAPIDA ], twin: 'second', quickCastReady: true }))).toMatchObject({ execution: null, quickCast: false });
    });

    it('Fixação Mágica: +1d6 no teste; no estágio máximo soma +5 ao dano', () => {
        const fixed = planCast(input({ passives: [ FIXACAO ], fixed: true }));
        expect(fixed.testDice).toEqual([ '1d6' ]);
        expect(fixed.effectSpecs).toEqual([]);

        const maxed = planCast(input({ passives: [ FIXACAO ], fixed: true, fixedAtMaxStage: true }));
        expect(maxed.testDice).toEqual([ '1d6' ]);
        expect(maxed.effectSpecs).toEqual([ { source: 'Fixação Mágica', dice: [], flat: 5, sameDie: 0 } ]);
        // outra magia não ganha nada
        expect(planCast(input({ passives: [ FIXACAO ], fixed: false })).testDice).toEqual([]);
    });

    it('Magia Guiada: um dado de 1d4 por acerto anterior, até 3', () => {
        expect(planCast(input({ passives: [ GUIADA ], guidedDice: 0 })).effectSpecs).toEqual([]);
        expect(planCast(input({ passives: [ GUIADA ], guidedDice: 1 })).effectSpecs).toEqual([ { source: 'Magia Guiada', dice: [ '1d4' ], flat: 0, sameDie: 0 } ]);
        expect(planCast(input({ passives: [ GUIADA ], guidedDice: 3 })).effectSpecs[0]?.dice).toEqual([ '3d4' ]);
        // o limite vale mesmo se a sequência passar dele
        expect(planCast(input({ passives: [ GUIADA ], guidedDice: 7 })).effectSpecs[0]?.dice).toEqual([ '3d4' ]);
    });

    it('tudo junto: o custo e os acréscimos de cada habilidade aparecem uma vez', () => {
        const plan = planCast(input({
            spell: spell(2), passives: [ INTENSIFICACAO, ESTAGIO_QUATRO, TEIA, FIXACAO, GUIADA ], selected: [ 'intensify', 'stageFour' ], twin: 'first', fixed: true, fixedAtMaxStage: true, guidedDice: 2
        }));
        expect(plan.cost).toBe(9 + 2 + 12 + 1);
        expect(plan.effectSpecs.map(spec => spec.source)).toEqual([ 'Intensificação Mágica', 'Estágio Quatro', 'Fixação Mágica', 'Magia Guiada' ]);
        expect(plan.testDice).toEqual([ '1d6' ]);
        expect(plan.critMarginReduction).toBe(2);
    });
});

describe('Conjuração Rápida e Teia da Realidade: regras auxiliares', () => {
    it('quickCastApplies lê o nível e a execução, em qualquer caixa e acento', () => {
        expect(quickCastApplies([ RAPIDA ], { level: 1, execution: 'padrão' })).toBe(true);
        expect(quickCastApplies([ RAPIDA ], { level: '1', execution: 'COMPLETA' })).toBe(true);
        expect(quickCastApplies([ RAPIDA ], { level: 2, execution: 'Padrão' })).toBe(false);
        expect(quickCastApplies([], { level: 1, execution: 'Padrão' })).toBe(false);
    });

    it('a Conjuração Rápida vale como usada na rodada em que foi usada', () => {
        expect(quickCastUsed(3, 3)).toBe(true);
        expect(quickCastUsed(2, 3)).toBe(false);
        expect(quickCastUsed(undefined, 3)).toBe(false);
    });

    it('twinCastRule e twinCastAllows', () => {
        expect(twinCastRule([ TEIA ])).toEqual({ maxLevel: 2, extraMp: 1 });
        expect(twinCastRule([])).toBeNull();
        expect(twinCastAllows([ TEIA ], spell(2))).toBe(true);
        expect(twinCastAllows([ TEIA ], spell(3))).toBe(false);
        expect(twinCastAllows([], spell(1))).toBe(false);
    });
});

describe('Fixação Mágica: a magia fixada', () => {
    it('lê o campo da ficha com cuidado', () => {
        expect(readFixedSpell({ fixedSpell: { key: 's1', name: 'Brasa Voraz' } })).toEqual({ key: 's1', name: 'Brasa Voraz' });
        expect(readFixedSpell({ fixedSpell: null })).toBeNull();
        expect(readFixedSpell({ fixedSpell: 'x' })).toBeNull();
        expect(readFixedSpell({ fixedSpell: { key: '', name: 'X' } })).toBeNull();
        expect(readFixedSpell(undefined)).toBeNull();
    });

    it('só vale com a habilidade na ficha', () => {
        const sheet = { fixedSpell: { key: 's1', name: 'Brasa Voraz' } };
        expect(isFixedSpell([ FIXACAO ], sheet, 's1')).toBe(true);
        expect(isFixedSpell([ FIXACAO ], sheet, 's2')).toBe(false);
        expect(isFixedSpell([], sheet, 's1')).toBe(false);
        expect(fixationRule([])).toBeNull();
    });

    it('o personagem é invulnerável à magia que fixou, mas só com a habilidade', () => {
        const sheet = { fixedSpell: { key: 's1', name: 'Brasa Voraz' } };
        expect(invulnerableSpellName(sheet, [ FIXACAO ])).toBe('Brasa Voraz');
        expect(invulnerableSpellName(sheet, [])).toBeNull();
        expect(invulnerableSpellName({}, [ FIXACAO ])).toBeNull();
    });
});

describe('Magia Guiada: a sequência de acertos', () => {
    const rule = guidedRule([ GUIADA ])!;

    it('a regra do catálogo', () => {
        expect(rule).toEqual({ die: '1d4', maxHits: 3 });
        expect(guidedRule([])).toBeNull();
    });

    it('o primeiro acerto abre a sequência em 1; o mesmo alvo com a mesma magia soma até o limite', () => {
        let guided = nextGuided(undefined, { kind: 'spellHit', targetId: 'goblin', spellKey: 'Brasa Voraz' }, rule.maxHits);
        expect(guided).toEqual({ targetId: 'goblin', spellKey: 'Brasa Voraz', hits: 1 });
        guided = nextGuided(guided, { kind: 'spellHit', targetId: 'goblin', spellKey: 'Brasa Voraz' }, rule.maxHits);
        expect(guided?.hits).toBe(2);
        guided = nextGuided(guided, { kind: 'spellHit', targetId: 'goblin', spellKey: 'Brasa Voraz' }, rule.maxHits);
        expect(guided?.hits).toBe(3);
        guided = nextGuided(guided, { kind: 'spellHit', targetId: 'goblin', spellKey: 'Brasa Voraz' }, rule.maxHits);
        expect(guided?.hits).toBe(3);
    });

    it('acertar outro alvo ou outra magia recomeça em 1; zerar apaga', () => {
        const chain = { targetId: 'goblin', spellKey: 'Brasa Voraz', hits: 2 };
        expect(nextGuided(chain, { kind: 'spellHit', targetId: 'orc', spellKey: 'Brasa Voraz' }, 3)).toEqual({ targetId: 'orc', spellKey: 'Brasa Voraz', hits: 1 });
        expect(nextGuided(chain, { kind: 'spellHit', targetId: 'goblin', spellKey: 'Raio' }, 3)).toEqual({ targetId: 'goblin', spellKey: 'Raio', hits: 1 });
        expect(nextGuided(chain, { kind: 'reset' }, 3)).toBeUndefined();
    });

    it('guidedBonusDice: só conta contra o mesmo alvo com a mesma magia, e só com a habilidade', () => {
        const chain = { targetId: 'goblin', spellKey: 'Brasa Voraz', hits: 2 };
        expect(guidedBonusDice([ GUIADA ], chain, 'goblin', 'Brasa Voraz')).toBe(2);
        expect(guidedBonusDice([ GUIADA ], chain, 'orc', 'Brasa Voraz')).toBe(0);
        expect(guidedBonusDice([ GUIADA ], chain, 'goblin', 'Raio')).toBe(0);
        expect(guidedBonusDice([ GUIADA ], chain, undefined, 'Brasa Voraz')).toBe(0);
        expect(guidedBonusDice([ GUIADA ], undefined, 'goblin', 'Brasa Voraz')).toBe(0);
        expect(guidedBonusDice([], chain, 'goblin', 'Brasa Voraz')).toBe(0);
        expect(guidedBonusDice([ GUIADA ], { ...chain, hits: 9 }, 'goblin', 'Brasa Voraz')).toBe(3);
    });
});
