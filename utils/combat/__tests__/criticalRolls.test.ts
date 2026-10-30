import type { AppliedEffect, Weapon } from '@models';
import type { CharsheetDTO, SpellDTO } from '@models/dtos';
import { parseActionRoll } from '../actionRollMessage';
import { critMargin, critMultiplier } from '../critical';
import { rollHitTest } from '../hitTest';
import { critMarginReduction, critMultiplierSources, effectCritMarginReduction, findPassive, ownedPassives } from '../passives';
import { buildSpellCastMessage, buildSpellEffectMessage, rollSpellEffect } from '../spellRoller';
import { buildDamageMessageText, buildHitMessageText, rollWeaponDamage, rollWeaponHit } from '../weaponRoller';

// diceRoller importa o barril de @enums, que puxa subscriptionEnum.ts (o ts-jest barra um erro de tipo antigo dele)
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' }
}));

const sheet = (classSkills: string[] = [], subclassSkills: string[] = []): CharsheetDTO => ({
    skills: { class: classSkills.map(name => ({ name })), subclass: subclassSkills.map(name => ({ name })) },
    attributes: { des: 10, vig: 5, foc: 15 },
    mods: { attributes: { des: 1, vig: 1, foc: 1 } },
    expertises: { Pontaria: { value: 4 }, Luta: { value: 2 }, Magia: { value: 6 } },
    elementalMastery: 'FOGO',
    stats: { lp: 50, maxLp: 100, mp: 30 }
}) as unknown as CharsheetDTO;

const weapon = (effect: Record<string, unknown>): Weapon => ({ id: 'w', name: 'Adaga', hit: 'des', categ: 'Arma Branca (Leve)', range: 'Corpo-a-corpo', effect: { effectType: 'Perfurante', ...effect } }) as unknown as Weapon;

const spell = (patch: Record<string, unknown> = {}): SpellDTO => ({
    id: 'brasa', name: 'Brasa Voraz', element: 'FOGO', level: 2, mpCost: 4, type: 'Ataque (imediato)',
    stages: [ 'Causa 2d6 de dano de fogo.', 'Causa 3d6 de dano de fogo.', 'Causa 4d6 de dano de fogo.' ], ...patch
}) as unknown as SpellDTO;

const withRandom = (value: number, run: () => void): void => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(value);
    try { run(); } finally { spy.mockRestore(); }
};

const appliedEffect = (name: string, modifiers: Array<Record<string, unknown>>): AppliedEffect => ({
    id: name, level: 1, snapshot: { name, levels: [ { modifiers } ] }
}) as unknown as AppliedEffect;

describe('acerto da arma: a margem sai do cadastro', () => {
    afterEach(() => jest.restoreAllMocks());

    it('margem 19 da arma: o 19 natural é crítico, e a mensagem diz', () => {
        const dagger = weapon({ value: '1d4', critValue: '3d4', critChance: 19 });
        withRandom(0.9, () => { // d20: 19
            const hit = rollWeaponHit(dagger, sheet());
            expect(hit.critMargin).toBe(19);
            expect(hit.critical).toBe(true);
            expect(buildHitMessageText('Aria', dagger, hit)).toContain('ACERTO CRÍTICO** (d20 ≥ 19)');
        });
    });

    it('sem margem no cadastro o 19 natural não é crítico, mas o 20 é', () => {
        const sword = weapon({ value: '1d8', critValue: '2d8', critChance: 0 });
        withRandom(0.9, () => { expect(rollWeaponHit(sword, sheet()).critical).toBe(false); });
        withRandom(0.99, () => {
            const hit = rollWeaponHit(sword, sheet());
            expect(hit.critical).toBe(true);
            expect(buildHitMessageText('Aria', sword, hit)).toContain('(d20 = 20)');
        });
    });

    it('as reduções das passivas e dos efeitos baixam a margem da arma', () => {
        const sword = weapon({ value: '1d8', critValue: '2d8', critChance: 20 });
        withRandom(0.85, () => { // d20: 18
            expect(rollWeaponHit(sword, sheet(), { critMarginReduction: 1 }).critical).toBe(false);
            expect(rollWeaponHit(sword, sheet(), { critMarginReduction: 2 }).critical).toBe(true);
        });
    });

    it('acerto que não é crítico não leva texto de crítico', () => {
        const sword = weapon({ value: '1d8', critValue: '2d8', critChance: 20 });
        withRandom(0.5, () => { expect(buildHitMessageText('Aria', sword, rollWeaponHit(sword, sheet()))).not.toContain('CRÍTICO'); });
    });
});

describe('dano crítico da arma', () => {
    afterEach(() => jest.restoreAllMocks());

    it('arma com fórmula própria de crítico rola essa fórmula e não tem multiplicador', () => {
        const dagger = weapon({ value: '1d4', critValue: '3d4', critChance: 19 });
        const result = rollWeaponDamage(dagger, true)!;
        expect(result.notation).toBe('3d4');
        expect(result.isCritical).toBe(true);
        expect(result.critMultiplier).toBeUndefined();
        expect(result.total).toBe(result.rolled);

        const parsed = parseActionRoll(buildDamageMessageText('Aria', dagger, result));
        expect(parsed).toMatchObject({ critical: true });
        expect(parsed?.multiplier).toBeUndefined();
    });

    it('arma sem fórmula de crítico rola o dano normal vezes 2 (o multiplicador padrão)', () => {
        const club = weapon({ value: '2d6', critValue: '', critChance: 20 });
        const result = rollWeaponDamage(club, true)!;
        expect(result.notation).toBe('2d6');
        expect(result.rolled).toBeGreaterThanOrEqual(2);
        expect(result.rolled).toBeLessThanOrEqual(12);
        expect(result.critMultiplier).toBe(2);
        expect(result.total).toBe(result.rolled * 2);

        const parsed = parseActionRoll(buildDamageMessageText('Aria', club, result));
        expect(parsed).toMatchObject({ critical: true, multiplier: 2, total: result.total });
        // o cartão mostra os valores rolados, sem multiplicar
        expect((parsed?.segments ?? []).reduce((sum, segment) => sum + segment.total, 0)).toBe(result.rolled);
    });

    it('uma habilidade sobe o multiplicador (×3) onde o crítico é multiplicador', () => {
        const club = weapon({ value: '2d6', critValue: '', critChance: 20 });
        const result = rollWeaponDamage(club, true, { critMultiplier: 3 })!;
        expect(result.critMultiplier).toBe(3);
        expect(result.total).toBe(result.rolled * 3);
    });

    it('os acréscimos das passivas entram na soma que o multiplicador dobra, e o Furtivo dobra o resultado', () => {
        const club = weapon({ value: '2d6', critValue: '', critChance: 20 });
        const extras = [ { source: 'Bom de Briga', dice: [], flat: 4, sameDie: 0 } ];

        const critical = rollWeaponDamage(club, true, { extras })!;
        expect(critical.total).toBe((critical.rolled + 4) * 2);

        const stealth = rollWeaponDamage(club, true, { extras, stealth: true })!;
        expect(stealth.total).toBe((stealth.rolled + 4) * 2 * 2);
        const parsed = parseActionRoll(buildDamageMessageText('Aria', club, stealth));
        expect(parsed).toMatchObject({ critical: true, stealth: true, multiplier: 2, total: stealth.total });
        // o cartão soma as rolagens (dados e acréscimo) sem multiplicar; o Total é essa soma vezes o crítico vezes o Furtivo
        expect((parsed?.segments ?? []).reduce((sum, segment) => sum + segment.total, 0) * 2 * 2).toBe(stealth.total);
    });

    it('dano que não é crítico não leva multiplicador, mesmo sem fórmula de crítico', () => {
        const club = weapon({ value: '2d6', critValue: '', critChance: 20 });
        const result = rollWeaponDamage(club, false, { critMultiplier: 3 })!;
        expect(result.total).toBe(result.rolled);
        expect(result.critMultiplier).toBeUndefined();
    });

    it('arma sem dano nenhum continua devolvendo nulo', () => {
        expect(rollWeaponDamage(weapon({ value: '', critValue: '' }), true)).toBeNull();
    });
});

describe('efeito da magia conjurada em crítico', () => {
    afterEach(() => jest.restoreAllMocks());

    it('o dano sai vezes o multiplicador e as rolagens mostram os valores sem multiplicar', () => {
        const normal = rollSpellEffect(spell(), 1);
        expect(normal.totalDamage).toBe(normal.segments[0]!.total);
        expect(normal.critMultiplier).toBeUndefined();

        const critical = rollSpellEffect(spell(), 1, [], { critMultiplier: 2 });
        expect(critical.critMultiplier).toBe(2);
        expect(critical.totalDamage).toBe(critical.segments[0]!.total * 2);
    });

    it('os acréscimos das passivas entram no que o crítico multiplica', () => {
        const extras = [ { source: 'Feitiçaria', dice: [], flat: 1, sameDie: 0 } ];
        const result = rollSpellEffect(spell(), 1, extras, { critMultiplier: 2 });
        const rolled = result.segments.reduce((sum, segment) => sum + segment.total, 0);
        expect(rolled).toBe(result.segments[0]!.total + 1);
        expect(result.totalDamage).toBe(rolled * 2);
    });

    it('a duração em turnos nunca dobra, e magia só de duração não tem multiplicador', () => {
        const mixed = spell({ stages: [ 'Causa 2d6 de dano e o alvo fica lento por 1d4 turnos.', '', '' ] });
        const result = rollSpellEffect(mixed, 1, [], { critMultiplier: 2 });
        const [ damage, duration ] = result.segments as [ typeof result.segments[number], typeof result.segments[number] ];
        expect(result.totalDamage).toBe(damage.total * 2 + duration.total);

        const onlyDuration = spell({ stages: [ 'O alvo fica lento por 1d4 turnos.', '', '' ] });
        const lone = rollSpellEffect(onlyDuration, 1, [], { critMultiplier: 2 });
        expect(lone.totalDamage).toBe(lone.segments[0]!.total);
        expect(lone.critMultiplier).toBeUndefined();
    });

    it('multiplicador 1 ou ausente não muda nada', () => {
        const one = rollSpellEffect(spell(), 1, [], { critMultiplier: 1 });
        expect(one.totalDamage).toBe(one.segments[0]!.total);
        expect(one.critMultiplier).toBeUndefined();
        const none = rollSpellEffect(spell(), 1, [], {});
        expect(none.totalDamage).toBe(none.segments[0]!.total);
    });

    it('as mensagens: a conjuração marca o crítico e o efeito leva o multiplicador, e tudo volta na leitura', () => {
        withRandom(0.95, () => { // d20: 20
            const test = rollHitTest('foc', sheet(), { critMargin: critMargin(20, 1) });
            expect(test.critical).toBe(true);

            const cast = parseActionRoll(buildSpellCastMessage('Aria', spell(), 2, test, 4, { critical: true }));
            expect(cast).toMatchObject({ kind: 'conjuração', critical: true });
            expect(cast?.notes?.some(note => note.includes('Acerto crítico (d20 ≥ 19)'))).toBe(true);

            const plain = parseActionRoll(buildSpellCastMessage('Aria', spell(), 2, test, 4));
            expect(plain?.critical).toBe(false);
        });
        const effect = rollSpellEffect(spell(), 2, [], { critMultiplier: 2 });
        const parsed = parseActionRoll(buildSpellEffectMessage('Aria', effect));
        expect(parsed).toMatchObject({ kind: 'efeito', critical: true, multiplier: 2, total: effect.totalDamage });
        expect(parseActionRoll(buildSpellEffectMessage('Aria', rollSpellEffect(spell(), 2)))).toMatchObject({ critical: false });
    });
});

describe('passivas e efeitos que mexem no crítico', () => {
    it('Ascensão Arcana baixa a margem das magias para 19 e não a da arma', () => {
        const owned = ownedPassives(sheet([ 'Ascensão Arcana' ]));
        const context = { sheet: sheet([ 'Ascensão Arcana' ]) };

        const forSpell = critMarginReduction(owned, context, 'spell', spell());
        expect(forSpell.reduction).toBe(1);
        expect(forSpell.notes).toEqual([ 'Ascensão Arcana: margem de crítico −1' ]);
        expect(critMargin(20, forSpell.reduction)).toBe(19);

        expect(critMarginReduction(owned, context, 'weapon').reduction).toBe(0);
        // a outra metade da habilidade continua valendo: metade do dano de ataques mágicos
        expect(findPassive('class', 'Ascensão Arcana')?.rules?.some(rule => rule.kind === 'defense' && rule.pct === 50)).toBe(true);
    });

    it('Forma Primordial (Brutamonte) baixa a margem em 2 enquanto o efeito está aplicado, em arma e magia', () => {
        const brutamonte = appliedEffect('Forma Primordial', [ { kind: 'flag', target: 'ignore_ap' }, { kind: 'stat_bonus', target: 'critMargin', value: -2 } ]);
        const cut = effectCritMarginReduction([ brutamonte ]);
        expect(cut.reduction).toBe(2);
        expect(cut.notes).toEqual([ 'Forma Primordial: margem de crítico −2' ]);
        expect(critMargin(20, cut.reduction)).toBe(18);
        expect(effectCritMarginReduction([])).toEqual({ reduction: 0, notes: [] });
        expect(effectCritMarginReduction(undefined)).toEqual({ reduction: 0, notes: [] });
    });

    it('a ativada Forma Primordial do catálogo carrega a redução de 2 no efeito', () => {
        const effect = findPassive('subclass', 'Forma Primordial')?.activation?.effect;
        expect(effect?.modifiers).toEqual(expect.arrayContaining([ { kind: 'stat_bonus', target: 'critMargin', value: -2 } ]));
    });

    it('efeito que sobe a margem, valor zero ou de outro alvo não conta; stat_penalty vale como redução', () => {
        expect(effectCritMarginReduction([ appliedEffect('A', [ { kind: 'stat_bonus', target: 'critMargin', value: 2 } ]) ]).reduction).toBe(0);
        expect(effectCritMarginReduction([ appliedEffect('B', [ { kind: 'stat_bonus', target: 'ap', value: -2 } ]) ]).reduction).toBe(0);
        expect(effectCritMarginReduction([ appliedEffect('C', [ { kind: 'stat_penalty', target: 'critMargin', value: 1 } ]) ]).reduction).toBe(1);
        expect(effectCritMarginReduction([ appliedEffect('D', [ { kind: 'stat_bonus', target: 'critMargin', value: -1 } ]), appliedEffect('E', [ { kind: 'stat_bonus', target: 'critMargin', value: -1 } ]) ]).reduction).toBe(2);
    });

    it('uma regra de multiplicador sobe o ×2 só onde a condição vale (genérica: o Furtivo do ladino usará assim)', () => {
        const owned = [ {
            key: 'class:teste', source: 'class', name: 'Prejuízo de Teste', mode: 'automatica',
            rules: [ { kind: 'critMultiplier', value: 3, when: { stealthy: true } } ]
        } ] as unknown as Parameters<typeof critMultiplierSources>[0];

        expect(critMultiplier(critMultiplierSources(owned, { sheet: sheet(), stealthy: true }, 'weapon'))).toBe(3);
        expect(critMultiplier(critMultiplierSources(owned, { sheet: sheet(), stealthy: false }, 'weapon'))).toBe(2);
        expect(critMultiplier(critMultiplierSources(owned, { sheet: sheet(), stealthy: true }, 'spell', spell()))).toBe(3);
    });

    it('regra com escopo só vale nele, e a redução nunca aumenta a margem', () => {
        const owned = [ {
            key: 'class:teste', source: 'class', name: 'Teste', mode: 'automatica',
            rules: [ { kind: 'critMargin', delta: -2, scope: 'weapon' }, { kind: 'critMargin', delta: 3, scope: 'spell' } ]
        } ] as unknown as Parameters<typeof critMarginReduction>[0];
        const context = { sheet: sheet() };

        expect(critMarginReduction(owned, context, 'weapon').reduction).toBe(2);
        expect(critMarginReduction(owned, context, 'spell', spell()).reduction).toBe(0);
    });
});
