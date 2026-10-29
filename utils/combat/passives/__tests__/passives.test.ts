import type { AppliedEffect } from '@models';
import { skills as allSkills } from '@constants/skills';
import { collectModifiers, modifiedStat, statShift } from '../../engine/modifiers';
import { computeDamage } from '../../engine/damage';
import {
    PASSIVE_CATALOG,
    abilityCost,
    abilityEffects,
    abilityStorageKey,
    buildAbilityEffect,
    conditionMet,
    describeLimits,
    effectDamageSpecs,
    effectHitBonus,
    findPassive,
    firstDie,
    initiativeAdvantages,
    isDurationExpression,
    isMeleeWeapon,
    isRangedWeapon,
    limitStatuses,
    NO_USES,
    ownedPassives,
    passiveEffects,
    passiveKey,
    passiveModeOf,
    passiveReminders,
    planAbility,
    regenPlans,
    rollSpecs,
    spellCostAdjustment,
    spellEffectSpecs,
    spellHitExtras,
    spellMatches,
    stealthGrants,
    sumSegments,
    weaponDamageSpecs,
    withPassiveEffects,
    type ExtraRoller,
    type PassiveContext,
    type PassiveSheet
} from '..';

const sheetWith = (classSkills: string[], subclassSkills: string[] = [], extra: Partial<PassiveSheet> = {}): PassiveSheet => ({
    skills: { class: classSkills.map(name => ({ name })), subclass: subclassSkills.map(name => ({ name })) },
    attributes: { foc: 12 },
    expertises: { Luta: { value: 5 } },
    elementalMastery: 'FOGO',
    stats: { lp: 40, maxLp: 100 },
    ...extra
});

const owned = (classSkills: string[], subclassSkills: string[] = [], extra: Partial<PassiveSheet> = {}) => {
    const sheet = sheetWith(classSkills, subclassSkills, extra);
    return { sheet, passives: ownedPassives(sheet), context: { sheet } as PassiveContext };
};

const sword = { categ: 'Arma Branca (Leve)', range: 'Corpo-a-corpo', effect: { value: '2d8+3', critValue: '4d8+3' } };
const rifle = { categ: 'Arma de Fogo (Pesada)', range: 'Longo', effect: { value: '3d6', critValue: '6d6' } };
const fixed = { categ: 'Arma Branca (Leve)', range: 'Corpo-a-corpo', effect: { value: '5', critValue: '10' } };

const spell = (overrides: Record<string, unknown> = {}) => ({ type: 'Ataque (imediato)', element: 'FOGO', ...overrides });

describe('catálogo de passivas', () => {
    it('tem 36 habilidades estruturadas: 25 automáticas e 11 ativadas', () => {
        const defs = [ ...PASSIVE_CATALOG.values() ];
        expect(defs).toHaveLength(36);
        expect(defs.filter(def => def.mode === 'automatica')).toHaveLength(25);
        expect(defs.filter(def => def.mode === 'ativada')).toHaveLength(11);
    });

    it('cada entrada é uma habilidade que existe em constants/skills.ts, na lista certa', () => {
        const names = {
            class: new Set(Object.values(allSkills.class).flat().map(skill => passiveKey('class', skill.name))),
            subclass: new Set(Object.values(allSkills.subclass).flat().map(skill => passiveKey('subclass', skill.name)))
        };
        for (const def of PASSIVE_CATALOG.values()) {
            expect(names[def.source].has(def.key)).toBe(true);
        }
    });

    it('automática traz regras e ativada traz a ativação; nenhuma traz as duas', () => {
        for (const def of PASSIVE_CATALOG.values()) {
            if (def.mode === 'automatica') {
                expect(def.rules?.length).toBeGreaterThan(0);
                expect(def.activation).toBeUndefined();
            } else {
                expect(def.activation).toBeDefined();
                expect(def.rules).toBeUndefined();
            }
        }
    });

    it('as 120 habilidades de classe e subclasse têm nomes únicos por lista', () => {
        const classKeys = Object.values(allSkills.class).flat().map(skill => passiveKey('class', skill.name));
        const subclassKeys = Object.values(allSkills.subclass).flat().map(skill => passiveKey('subclass', skill.name));
        expect(classKeys).toHaveLength(48);
        expect(subclassKeys).toHaveLength(72);
        expect(new Set(classKeys).size).toBe(48);
        expect(new Set(subclassKeys).size).toBe(72);
    });

    it('a chave ignora acento e caixa', () => {
        expect(passiveKey('class', 'Regeneração Furiosa')).toBe('class:regeneracao furiosa');
        expect(findPassive('class', 'REGENERACAO furiosa')?.name).toBe('Regeneração Furiosa');
    });

    it('habilidade fora do catálogo é só texto', () => {
        expect(passiveModeOf('class', 'Treinado')).toBe('texto');
        expect(passiveModeOf('class', 'Armado')).toBe('automatica');
        expect(passiveModeOf('class', 'Cura Interior')).toBe('ativada');
    });
});

describe('ownedPassives', () => {
    it('acha as passivas pelas habilidades liberadas na ficha, de classe e de subclasse', () => {
        const { passives } = owned([ 'Armado', 'Treinado' ], [ 'Trilheiro' ]);
        expect(passives.map(passive => passive.name).sort()).toEqual([ 'Armado', 'Trilheiro' ]);
    });

    it('lê lista gravada como objeto de chaves numéricas (o Firestore devolve assim)', () => {
        const sheet = { skills: { class: { 0: { name: 'Armado' }, 1: { name: 'Bom de Briga' } } } } as PassiveSheet;
        expect(ownedPassives(sheet).map(passive => passive.name)).toEqual([ 'Armado', 'Bom de Briga' ]);
    });

    it('ficha de sistema customizado e ficha sem habilidades não têm passivas', () => {
        expect(ownedPassives(sheetWith([ 'Armado' ], [], { systemId: 'meu-sistema' }))).toEqual([]);
        expect(ownedPassives(null)).toEqual([]);
        expect(ownedPassives({})).toEqual([]);
    });

    it('não confunde habilidade de classe com a de subclasse de mesmo nome', () => {
        // "Fraternidade" existe no Druida (classe) e no Animante (subclasse); nenhuma está no catálogo
        expect(ownedPassives(sheetWith([ 'Fraternidade' ], [ 'Fraternidade' ]))).toEqual([]);
        // O nome de uma passiva de subclasse na lista da classe não vale
        expect(ownedPassives(sheetWith([ 'Trilheiro' ]))).toEqual([]);
    });
});

describe('conditionMet', () => {
    const ctx = (lp: number, maxLp: number, extra: Partial<PassiveContext> = {}): PassiveContext => ({ sheet: { stats: { lp, maxLp } }, ...extra });

    it('sem condição vale sempre', () => {
        expect(conditionMet(undefined, ctx(1, 100))).toBe(true);
    });

    it('LP em porcentagem do máximo', () => {
        expect(conditionMet({ lpAtMostPct: 10 }, ctx(10, 100))).toBe(true);
        expect(conditionMet({ lpAtMostPct: 10 }, ctx(11, 100))).toBe(false);
        expect(conditionMet({ lpBelowPct: 50 }, ctx(49, 100))).toBe(true);
        expect(conditionMet({ lpBelowPct: 50 }, ctx(50, 100))).toBe(false);
    });

    it('LP em pontos', () => {
        expect(conditionMet({ lpAtMost: 20 }, ctx(20, 100))).toBe(true);
        expect(conditionMet({ lpAtMost: 20 }, ctx(21, 100))).toBe(false);
    });

    it('sem LP máximo a condição em porcentagem não vale', () => {
        expect(conditionMet({ lpAtMostPct: 10 }, ctx(0, 0))).toBe(false);
    });

    it('furtivo e alvo que ainda não agiu', () => {
        expect(conditionMet({ stealthy: true }, ctx(1, 10, { stealthy: true }))).toBe(true);
        expect(conditionMet({ stealthy: true }, ctx(1, 10))).toBe(false);
        expect(conditionMet({ targetNotActed: true }, ctx(1, 10, { targetNotActed: true }))).toBe(true);
        expect(conditionMet({ targetNotActed: true }, ctx(1, 10))).toBe(false);
    });
});

describe('dano da arma', () => {
    it('reconhece arma branca e arma de longo alcance, fogo ou energia', () => {
        expect(isMeleeWeapon(sword)).toBe(true);
        expect(isMeleeWeapon(rifle)).toBe(false);
        expect(isRangedWeapon(rifle)).toBe(true);
        expect(isRangedWeapon({ categ: 'Arma de Longo Alcance (Leve)' })).toBe(true);
        expect(isRangedWeapon({ categ: 'Arma de Energia (Pesada)' })).toBe(true);
        expect(isRangedWeapon(sword)).toBe(false);
        expect(isRangedWeapon({ categ: 'Arma Mágica (Leve)' })).toBe(false);
    });

    it('lê o primeiro dado da fórmula', () => {
        expect(firstDie('2d8+3')).toEqual({ count: 2, sides: 8 });
        expect(firstDie('5')).toBeNull();
        expect(firstDie(undefined)).toBeNull();
    });

    it('Bom de Briga soma o valor de Luta só em arma branca', () => {
        const { passives, context } = owned([ 'Bom de Briga' ]);
        expect(weaponDamageSpecs(passives, context, sword)).toEqual([ { source: 'Bom de Briga', dice: [], flat: 5, sameDie: 0 } ]);
        expect(weaponDamageSpecs(passives, context, rifle)).toEqual([]);
    });

    it('Armado dá +1 dado do mesmo tipo da arma, e nada em dano fixo', () => {
        const { passives, context } = owned([ 'Armado' ]);
        expect(weaponDamageSpecs(passives, context, sword)).toEqual([ { source: 'Armado', dice: [ '1d8' ], flat: 0, sameDie: 0 } ]);
        expect(weaponDamageSpecs(passives, context, fixed)).toEqual([]);
        expect(weaponDamageSpecs(passives, context, rifle)).toEqual([]);
    });

    it('Sempre Distante dá +1 dado à distância e +2 a mais se furtivo', () => {
        const { passives, sheet } = owned([ 'Sempre Distante' ]);
        expect(weaponDamageSpecs(passives, { sheet }, rifle).map(spec => spec.dice)).toEqual([ [ '1d6' ] ]);
        expect(weaponDamageSpecs(passives, { sheet, stealthy: true }, rifle).map(spec => spec.dice)).toEqual([ [ '1d6' ], [ '2d6' ] ]);
        expect(weaponDamageSpecs(passives, { sheet, stealthy: true }, sword)).toEqual([]);
    });

    it('Força Vital soma o LP restante só com 20 LP ou menos', () => {
        const low = owned([ 'Força Vital' ], [], { stats: { lp: 18, maxLp: 100 } });
        expect(weaponDamageSpecs(low.passives, low.context, sword)).toEqual([ { source: 'Força Vital', dice: [], flat: 18, sameDie: 0 } ]);
        const high = owned([ 'Força Vital' ], [], { stats: { lp: 21, maxLp: 100 } });
        expect(weaponDamageSpecs(high.passives, high.context, sword)).toEqual([]);
    });

    it('Abscondido soma 10 só furtivo; Sombras Penetrantes 2d6 só furtivo', () => {
        const { passives, sheet } = owned([ 'Abscondido' ], [ 'Sombras Penetrantes' ]);
        expect(weaponDamageSpecs(passives, { sheet }, sword)).toEqual([]);
        expect(weaponDamageSpecs(passives, { sheet, stealthy: true }, sword)).toEqual([
            { source: 'Abscondido', dice: [], flat: 10, sameDie: 0 },
            { source: 'Sombras Penetrantes', dice: [ '2d6' ], flat: 0, sameDie: 0 }
        ]);
    });

    it('Ataque Calculado vale contra quem ainda não agiu; Aura Decadente sempre', () => {
        const { passives, sheet } = owned([], [ 'Ataque Calculado', 'Aura Decadente' ]);
        expect(weaponDamageSpecs(passives, { sheet }, sword).map(spec => spec.source)).toEqual([ 'Aura Decadente' ]);
        expect(weaponDamageSpecs(passives, { sheet, targetNotActed: true }, sword).map(spec => spec.source)).toEqual([ 'Ataque Calculado', 'Aura Decadente' ]);
    });
});

describe('magia', () => {
    it('spellMatches: categoria, subtipo e elemento', () => {
        const { sheet } = owned([]);
        const context = { sheet };
        expect(spellMatches({ attack: true }, spell(), context)).toBe(true);
        expect(spellMatches({ attack: true }, spell({ type: 'Cura (imediato)' }), context)).toBe(false);
        expect(spellMatches({ attack: true }, spell({ type: 'Ataque/Recuperação (imediato)' }), context)).toBe(true);
        expect(spellMatches({ subtype: 'conjurado' }, spell({ type: 'Ataque (conjurado)' }), context)).toBe(true);
        expect(spellMatches({ subtype: 'conjurado' }, spell({ type: 'Ataque (imediato)' }), context)).toBe(false);
        expect(spellMatches({ element: 'nonElemental' }, spell({ element: 'NÃO-ELEMENTAL' }), context)).toBe(true);
        expect(spellMatches({ element: 'nonElemental' }, spell({ element: 'FOGO' }), context)).toBe(false);
        expect(spellMatches({ element: 'mastery' }, spell({ element: 'Fogo' }), context)).toBe(true);
        expect(spellMatches({ element: 'mastery' }, spell({ element: 'ÁGUA' }), context)).toBe(false);
        expect(spellMatches({ element: 'trevas' }, spell({ element: 'TREVAS' }), context)).toBe(true);
    });

    it('sem maestria elemental a regra "da maestria" não vale em magia nenhuma', () => {
        const { sheet } = owned([], [], { elementalMastery: '' });
        expect(spellMatches({ element: 'mastery' }, spell({ element: '' }), { sheet })).toBe(false);
        expect(spellMatches({ element: 'mastery' }, spell(), { sheet })).toBe(false);
    });

    it('Feitiçaria soma 1 só em magia de ataque', () => {
        const { passives, context } = owned([ 'Feitiçaria' ]);
        expect(spellEffectSpecs(passives, context, spell())).toEqual([ { source: 'Feitiçaria', dice: [], flat: 1, sameDie: 0 } ]);
        expect(spellEffectSpecs(passives, context, spell({ type: 'Cura (imediato)' }))).toEqual([]);
    });

    it('Magia Resiliente soma o Foco em toda magia; Manipulação Elemental +1d8', () => {
        const { passives, context } = owned([ 'Magia Resiliente' ], [ 'Manipulação Elemental' ]);
        expect(spellEffectSpecs(passives, context, spell({ type: 'Cura (imediato)' }))).toEqual([
            { source: 'Magia Resiliente', dice: [], flat: 12, sameDie: 0 },
            { source: 'Manipulação Elemental', dice: [ '1d8' ], flat: 0, sameDie: 0 }
        ]);
    });

    it('Não-Elementalista dá +1 dado do mesmo tipo e vantagem no teste, só em magia não-elemental', () => {
        const { passives, context } = owned([ 'Não-Elementalista' ]);
        const neutral = spell({ element: 'NÃO-ELEMENTAL' });
        expect(spellEffectSpecs(passives, context, neutral)).toEqual([ { source: 'Não-Elementalista', dice: [], flat: 0, sameDie: 1 } ]);
        expect(spellHitExtras(passives, context, neutral)).toEqual({ advantages: 1, flat: 0, notes: [ 'Não-Elementalista: vantagem, +1d20' ] });
        expect(spellEffectSpecs(passives, context, spell())).toEqual([]);
        expect(spellHitExtras(passives, context, spell()).advantages).toBe(0);
    });

    it('Domínio Elemental: 2d6 e +2 no teste na magia do elemento da maestria', () => {
        const { passives, context } = owned([], [ 'Domínio Elemental' ]);
        expect(spellEffectSpecs(passives, context, spell({ element: 'FOGO' }))[0]?.dice).toEqual([ '2d6' ]);
        expect(spellHitExtras(passives, context, spell({ element: 'FOGO' }))).toEqual({ advantages: 0, flat: 2, notes: [ 'Domínio Elemental: +2' ] });
        expect(spellEffectSpecs(passives, context, spell({ element: 'ÁGUA' }))).toEqual([]);
    });

    it('Conjuração soma 3d8 em magia conjurada; Aura Decadente 1d6 em magia de trevas', () => {
        const { passives, context } = owned([], [ 'Conjuração', 'Aura Decadente' ]);
        expect(spellEffectSpecs(passives, context, spell({ type: 'Ataque (conjurado)', element: 'FOGO' })).map(spec => spec.dice)).toEqual([ [ '3d8' ] ]);
        expect(spellEffectSpecs(passives, context, spell({ type: 'Ataque (imediato)', element: 'TREVAS' })).map(spec => spec.dice)).toEqual([ [ '1d6' ] ]);
    });

    it('Força Vital e Ataque Calculado também valem em magia de ataque', () => {
        const { passives, sheet } = owned([ 'Força Vital' ], [ 'Ataque Calculado' ], { stats: { lp: 10, maxLp: 100 } });
        const specs = spellEffectSpecs(passives, { sheet, targetNotActed: true }, spell());
        expect(specs.map(spec => spec.source)).toEqual([ 'Força Vital', 'Ataque Calculado' ]);
        expect(spellEffectSpecs(passives, { sheet }, spell({ type: 'Cura (imediato)' }))).toEqual([]);
    });

    it('Magismo Total tira 1 MP e o MP extra da Maestria', () => {
        const { passives } = owned([ 'Magismo Total' ]);
        expect(spellCostAdjustment(passives)).toEqual({ delta: -1, freeMasteryExtra: true, sources: [ 'Magismo Total' ] });
        expect(spellCostAdjustment([])).toEqual({ delta: 0, freeMasteryExtra: false, sources: [] });
    });

    it('duração em turnos não é dano nem cura', () => {
        expect(isDurationExpression('O alvo fica lento por 1d4 turnos.', '1d4')).toBe(true);
        expect(isDurationExpression('Dura 2d6 rodadas', '2d6')).toBe(true);
        expect(isDurationExpression('Causa 3d8 de dano de fogo.', '3d8')).toBe(false);
        expect(isDurationExpression('Cura 2d6+3 LP.', '2d6+3')).toBe(false);
    });
});

describe('iniciativa', () => {
    it('Reflexos Aumentados dá +1 dado', () => {
        const { passives } = owned([ 'Reflexos Aumentados' ]);
        expect(initiativeAdvantages(passives)).toEqual({ advantages: 1, notes: [ 'Reflexos Aumentados: vantagem, +1d20' ] });
        expect(initiativeAdvantages([])).toEqual({ advantages: 0, notes: [] });
    });
});

describe('rollSpecs', () => {
    const roller: ExtraRoller = (notation) => ({ total: notation.split('+').length * 4, display: `[${notation.split('+').map(() => 4).join(', ')}]` });

    it('rola os dados do acréscimo e soma o valor fixo', () => {
        const segments = rollSpecs([
            { source: 'Armado', dice: [ '1d8' ], flat: 0, sameDie: 0 },
            { source: 'Bom de Briga', dice: [], flat: 5, sameDie: 0 },
            { source: 'Mestre', dice: [ '1d6' ], flat: 2, sameDie: 0 }
        ], roller);
        expect(segments).toEqual([
            { source: 'Armado', notation: 'Armado 1d8', display: '[4]', total: 4 },
            { source: 'Bom de Briga', notation: 'Bom de Briga 5', display: '5', total: 5 },
            { source: 'Mestre', notation: 'Mestre 1d6+2', display: '[4] + 2', total: 6 }
        ]);
        expect(sumSegments(segments)).toBe(15);
    });

    it('sameDie usa o dado do efeito da magia; sem dado não rola', () => {
        const spec = { source: 'Não-Elementalista', dice: [], flat: 0, sameDie: 1 };
        expect(rollSpecs([ spec ], roller, { sides: 6 })[0]?.notation).toBe('Não-Elementalista 1d6');
        expect(rollSpecs([ spec ], roller)).toEqual([]);
    });

    it('pula o acréscimo cuja rolagem falhou', () => {
        expect(rollSpecs([ { source: 'X', dice: [ '1d8' ], flat: 0, sameDie: 0 } ], () => null)).toEqual([]);
    });
});

describe('efeitos de habilidade ativada', () => {
    const effectWith = (name: string, modifiers: unknown[]): AppliedEffect => ({
        id: name,
        effectId: name,
        level: 1,
        remaining: 2,
        appliedAtRound: 1,
        snapshot: { id: name, name, levels: [ { level: 1, formula: '0', duration: 2, modifiers } ] }
    }) as unknown as AppliedEffect;

    const context: PassiveContext = { sheet: {} };

    it('dados de dano valem por alvo: arma, corpo a corpo, magia, qualquer um e furtivo', () => {
        const effects = [
            effectWith('Lobo', [ { kind: 'damage_dealt_bonus', value: '1d8', target: 'melee' } ]),
            effectWith('Ki', [ { kind: 'damage_dealt_bonus', value: '2d4', target: 'any' } ]),
            effectWith('Sombra', [ { kind: 'damage_dealt_bonus', value: '1d10', target: 'stealth' } ])
        ];
        expect(effectDamageSpecs(effects, context, 'weapon', sword).map(spec => spec.source)).toEqual([ 'Lobo', 'Ki' ]);
        expect(effectDamageSpecs(effects, context, 'weapon', rifle).map(spec => spec.source)).toEqual([ 'Ki' ]);
        expect(effectDamageSpecs(effects, context, 'spell').map(spec => spec.source)).toEqual([ 'Ki' ]);
        expect(effectDamageSpecs(effects, { sheet: {}, stealthy: true }, 'weapon', sword).map(spec => spec.source)).toEqual([ 'Lobo', 'Ki', 'Sombra' ]);
    });

    it('ignora valor que não é dado (porcentagem e número são do motor do mestre)', () => {
        const effects = [ effectWith('Avatar', [ { kind: 'damage_dealt_bonus', value: '100%' }, { kind: 'damage_dealt_bonus', value: 5 } ]) ];
        expect(effectDamageSpecs(effects, context, 'weapon', sword)).toEqual([]);
    });

    it('bônus de acerto vem de stat_bonus em "hit"', () => {
        const effects = [ effectWith('Ritmo da Batalha', [ { kind: 'stat_bonus', target: 'hit', value: 2 }, { kind: 'stat_bonus', target: 'apIgnore', value: 2 } ]) ];
        expect(effectHitBonus(effects)).toEqual({ flat: 2, notes: [ 'Ritmo da Batalha: +2' ] });
        expect(effectHitBonus([])).toEqual({ flat: 0, notes: [] });
    });
});

describe('passiveEffects (para o motor)', () => {
    it('Pele Resistente dá +2 de AP', () => {
        const { passives, context } = owned([], [ 'Pele Resistente' ]);
        const effects = passiveEffects(passives, context);
        expect(effects).toHaveLength(1);
        expect(effects[0]?.snapshot.name).toBe('Pele Resistente');
        expect(effects[0]?.passive?.key).toBe('subclass:pele resistente');
        expect(modifiedStat(collectModifiers(effects), 'ap', 5)).toBe(7);
    });

    it('Trilheiro dá imunidade ao terreno difícil', () => {
        const { passives, context } = owned([], [ 'Trilheiro' ]);
        expect(collectModifiers(passiveEffects(passives, context)).flags['terrain_immunity']).toBe(true);
    });

    it('Abscondido dá +2 de AP só furtivo', () => {
        const { passives, sheet } = owned([ 'Abscondido' ]);
        expect(passiveEffects(passives, { sheet })).toEqual([]);
        expect(statShift(collectModifiers(passiveEffects(passives, { sheet, stealthy: true })), 'ap')).toBe(2);
    });

    it('Muralha dá +50% de dano causado só com LP em 10% ou menos', () => {
        const low = owned([ 'Muralha' ], [], { stats: { lp: 8, maxLp: 100 } });
        expect(collectModifiers(passiveEffects(low.passives, low.context)).dealt).toEqual({ pct: 50, flat: 0 });
        const high = owned([ 'Muralha' ], [], { stats: { lp: 60, maxLp: 100 } });
        expect(passiveEffects(high.passives, high.context)).toEqual([]);
    });

    it('Imunidade Mágica zera o dano de magia do elemento da maestria, e só o de magia', () => {
        const { passives, context } = owned([ 'Imunidade Mágica' ]);
        const taken = collectModifiers(passiveEffects(passives, context)).taken;
        const base = { defense: 'none' as const, targetAp: 0, resistanceMod: 0, taken };
        expect(computeDamage({ ...base, rolled: 30, kind: 'magico', attackType: 'Fogo' }).final).toBe(0);
        expect(computeDamage({ ...base, rolled: 30, kind: 'magico', attackType: 'Água' }).final).toBe(30);
        expect(computeDamage({ ...base, rolled: 30, kind: 'fisico', attackType: 'Fogo' }).final).toBe(30);
    });

    it('Ascensão Arcana corta pela metade o dano de magia de qualquer elemento', () => {
        const { passives, context } = owned([ 'Ascensão Arcana' ]);
        const taken = collectModifiers(passiveEffects(passives, context)).taken;
        const base = { defense: 'none' as const, targetAp: 0, resistanceMod: 0, taken };
        expect(computeDamage({ ...base, rolled: 30, kind: 'magico', attackType: 'Água' }).final).toBe(15);
        expect(computeDamage({ ...base, rolled: 30, kind: 'fisico' }).final).toBe(30);
    });

    it('sem maestria elemental, Imunidade Mágica não protege de nada', () => {
        const { passives, context } = owned([ 'Imunidade Mágica' ], [], { elementalMastery: '' });
        expect(passiveEffects(passives, context)).toEqual([]);
    });

    it('passiva só de rolagem (Armado) não gera efeito para o motor', () => {
        const { passives, context } = owned([ 'Armado', 'Feitiçaria' ]);
        expect(passiveEffects(passives, context)).toEqual([]);
    });

    it('junta os efeitos aplicados aos derivados, sem mexer na lista original', () => {
        const { passives, context } = owned([], [ 'Pele Resistente' ]);
        const applied: AppliedEffect[] = [];
        const merged = withPassiveEffects(applied, passives, context);
        expect(merged).toHaveLength(1);
        expect(applied).toHaveLength(0);
        expect(withPassiveEffects(null, [], context)).toEqual([]);
    });

    it('lembretes do mestre para quem defende', () => {
        const { passives } = owned([], [ 'Resiliência Inata', 'Pele Resistente' ]);
        expect(passiveReminders(passives, 'defender')).toEqual([
            'Resiliência Inata: reduza todo dano recebido em 1d8+1.',
            'Pele Resistente: imune a calor, frio e radiação extremos e a queimadura, congelamento e necrose.'
        ]);
        expect(passiveReminders(passives, 'attacker')).toEqual([]);
    });
});

describe('começo do turno e furtividade', () => {
    it('Regeneração Furiosa regenera até 50% do máximo enquanto o LP está abaixo de 50%', () => {
        const low = owned([ 'Regeneração Furiosa' ], [], { stats: { lp: 45, maxLp: 100 } });
        expect(regenPlans(low.passives, low.context)).toEqual([ { source: 'Regeneração Furiosa', dice: '1d6', room: 5 } ]);
        const half = owned([ 'Regeneração Furiosa' ], [], { stats: { lp: 50, maxLp: 100 } });
        expect(regenPlans(half.passives, half.context)).toEqual([]);
        const empty = owned([ 'Regeneração Furiosa' ], [], { stats: { lp: 10, maxLp: 0 } });
        expect(regenPlans(empty.passives, empty.context)).toEqual([]);
    });

    it('Disfarce dá +1 Padrão ao entrar em furtividade e Ligeireza +2 Movimento no começo do turno', () => {
        const { passives, sheet } = owned([ 'Disfarce', 'Ligeireza' ]);
        expect(stealthGrants(passives, 'enter', { sheet, stealthy: true })).toEqual([ { source: 'Disfarce', padrao: 1, movimento: 0 } ]);
        expect(stealthGrants(passives, 'turnStart', { sheet, stealthy: true })).toEqual([ { source: 'Ligeireza', padrao: 0, movimento: 2 } ]);
        expect(stealthGrants(passives, 'enter', { sheet })).toEqual([]);
    });
});

describe('habilidades ativadas', () => {
    const curaInterior = 'class:cura interior';

    it('a chave de armazenamento não tem caractere proibido em caminho de campo', () => {
        expect(abilityStorageKey(curaInterior)).toBe('class-cura-interior');
        expect(abilityStorageKey('subclass:Postura Defensiva')).toBe('subclass-postura-defensiva');
    });

    it('conta os usos por dia e por combate', () => {
        const activation = findPassive('class', 'Cura Interior')!.activation!;
        const statuses = limitStatuses(activation, curaInterior, { day: { 'class-cura-interior': 2 }, combat: { 'class-cura-interior': 1 } });
        expect(statuses).toEqual([
            { per: 'dia', max: 3, used: 2, left: 1 },
            { per: 'combate', max: 1, used: 1, left: 0 }
        ]);
        expect(describeLimits(statuses)).toBe('1 de 3 por dia · 0 de 1 por combate');
    });

    it('libera a habilidade com usos sobrando', () => {
        const plan = planAbility({ key: curaInterior, currentMp: 0, uses: NO_USES, owned: true });
        expect(plan.ok).toBe(true);
        expect(plan.cost).toBe(0);
        expect(plan.def?.name).toBe('Cura Interior');
    });

    it('bloqueia sem a habilidade, esgotada, sem MP e sem escolha', () => {
        expect(planAbility({ key: curaInterior, currentMp: 9, uses: NO_USES, owned: false }).block).toBe('sem-habilidade');
        expect(planAbility({ key: 'class:armado', currentMp: 9, uses: NO_USES, owned: true }).block).toBe('nao-ativada');
        expect(planAbility({ key: 'class:inexistente', currentMp: 9, uses: NO_USES, owned: true }).block).toBe('nao-ativada');
        expect(planAbility({ key: curaInterior, currentMp: 9, uses: { day: {}, combat: { 'class-cura-interior': 1 } }, owned: true }).block).toBe('limite');
        expect(planAbility({ key: 'subclass:postura defensiva', currentMp: 4, uses: NO_USES, owned: true }).block).toBe('sem-mp');
        expect(planAbility({ key: 'subclass:postura bestial', currentMp: 0, uses: NO_USES, owned: true }).block).toBe('escolha-ausente');
        expect(planAbility({ key: 'subclass:postura bestial', choiceId: 'tigre', currentMp: 0, uses: NO_USES, owned: true }).block).toBe('escolha-invalida');
    });

    it('a variação escolhida vem no plano', () => {
        const plan = planAbility({ key: 'subclass:postura bestial', choiceId: 'lobo', currentMp: 0, uses: NO_USES, owned: true });
        expect(plan.ok).toBe(true);
        expect(plan.choice?.label).toBe('Postura do Lobo');
    });

    it('Forma Primordial gasta todo o MP e não roda sem nenhum', () => {
        const activation = findPassive('subclass', 'Forma Primordial')!.activation!;
        expect(abilityCost(activation, 23)).toBe(23);
        expect(planAbility({ key: 'subclass:forma primordial', currentMp: 23, uses: NO_USES, owned: true }).cost).toBe(23);
        expect(planAbility({ key: 'subclass:forma primordial', currentMp: 0, uses: NO_USES, owned: true }).block).toBe('sem-mp');
    });

    it('monta o efeito da habilidade com duração em turnos, rodadas ou até o fim do combate', () => {
        const postura = findPassive('subclass', 'Postura Defensiva')!;
        const built = buildAbilityEffect(postura, postura.activation!.effect!, null, 3, 'Aria', 'sheet-1');
        expect(built.snapshot.name).toBe('Postura Defensiva');
        expect(built.snapshot.timing).toBe('turn');
        expect(built.remaining).toBe(2);
        expect(built.indefinite).toBeUndefined();
        expect(built.ability).toEqual({ key: 'subclass:postura defensiva' });
        expect(built.appliedAtRound).toBe(3);
        expect(modifiedStat(collectModifiers([ built ]), 'ap', 5)).toBe(8);

        const forma = findPassive('subclass', 'Forma Primordial')!;
        const untilEnd = buildAbilityEffect(forma, forma.activation!.effect!, null, 1, 'Aria', 'sheet-1');
        expect(untilEnd.indefinite).toBe(true);
        expect(untilEnd.remaining).toBe(0);
        expect(collectModifiers([ untilEnd ]).flags['ignore_ap']).toBe(true);

        const bestial = findPassive('subclass', 'Postura Bestial')!;
        const lobo = bestial.activation!.choices![1]!;
        const wolf = buildAbilityEffect(bestial, lobo.effect, lobo, 1, 'Aria', 'sheet-1');
        expect(wolf.snapshot.name).toBe('Postura do Lobo');
        expect(wolf.ability).toEqual({ key: 'subclass:postura bestial', choiceId: 'lobo' });
        expect(abilityEffects([ wolf, { ...wolf, ability: undefined } as AppliedEffect ])).toHaveLength(1);
    });
});
