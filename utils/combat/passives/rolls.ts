import type { AppliedEffect } from '@models';
import { getSpellCategories, getSpellSubtypes } from '@utils/spellCategory';
import { normalizeSearchText } from '@utils/searchText';
import { meleeReach } from '../engine/opportunity';
import { conditionMet, sheetFoc, sheetLp, sheetLuta, sheetMastery, type PassiveContext } from './owned';
import type { PassiveDef, PassiveExtra, PassiveRule, SpellFilter, WeaponFilter } from './types';

/**
 * As passivas **automáticas** que mexem numa rolagem do próprio jogador: dano da arma, efeito (dano ou cura) da magia, teste e custo de MP da magia e iniciativa. Puro: diz
 * **o que somar** (`ExtraSpec`); quem rola (`weaponRoller`, `spellRoller`) transforma isso em dados e o chat mostra de onde veio cada um.
 */

/** Um acréscimo ao dano ou à cura, de uma passiva ou de um efeito da habilidade ativada */
export interface ExtraSpec {
    /** De onde vem ("Armado", "Postura do Lobo") */
    source: string;
    /** Dados a rolar, cada um "XdY" */
    dice: string[];
    /** Valor fixo */
    flat: number;
    /** Dados a mais do mesmo tipo do dano rolado (a arma: o primeiro dado da fórmula; a magia: o dado do efeito) */
    sameDie: number;
}

/** Um acréscimo já rolado, no formato dos segmentos do cartão de dados */
export interface ExtraSegment {
    source: string;
    notation: string;
    display: string;
    total: number;
}

export type ExtraRoller = (notation: string) => { total: number; display: string } | null;

const DIE = /(\d+)\s*d\s*(\d+)/i;

/** O primeiro dado de uma fórmula ("2d8+3" → 8 faces); `null` se não há dado (dano fixo) */
export function firstDie(formula: unknown): { count: number; sides: number } | null {
    const match = DIE.exec(String(formula ?? ''));
    return match ? { count: Number(match[1]), sides: Number(match[2]) } : null;
}

interface WeaponLike {
    categ?: unknown;
    range?: unknown;
    effect?: { value?: unknown; critValue?: unknown } | null;
}

const category = (weapon: WeaponLike): string => normalizeSearchText(weapon.categ);

/** Arma branca (corpo a corpo) */
export const isMeleeWeapon = (weapon: WeaponLike): boolean => meleeReach(weapon) !== null;

/** Arma de fogo, de longo alcance ou de energia (premissa minha: a de energia conta como de fogo) */
export const isRangedWeapon = (weapon: WeaponLike): boolean =>
    [ 'arma de fogo', 'arma de longo alcance', 'arma de energia' ].some(prefix => category(weapon).startsWith(prefix));

function weaponMatches(filter: WeaponFilter | undefined, weapon: WeaponLike): boolean {
    if (!filter) return true;
    if (filter.melee && !isMeleeWeapon(weapon)) return false;
    if (filter.ranged && !isRangedWeapon(weapon)) return false;
    return true;
}

interface SpellLike {
    type?: string | null;
    element?: unknown;
}

const isNonElemental = (element: unknown): boolean => normalizeSearchText(element).replace(/[\s-]+/g, '').startsWith('naoelemental');

export function spellMatches(filter: SpellFilter | undefined, spell: SpellLike, context: PassiveContext): boolean {
    if (!filter) return true;
    if (filter.attack && !getSpellCategories(spell.type).includes('Ataque')) return false;
    if (filter.subtype) {
        const wanted = normalizeSearchText(filter.subtype);
        if (!getSpellSubtypes(spell.type).some(subtype => normalizeSearchText(subtype) === wanted)) return false;
    }
    if (filter.element) {
        const element = normalizeSearchText(spell.element);
        if (filter.element === 'nonElemental') {
            if (!isNonElemental(spell.element)) return false;
        } else if (filter.element === 'mastery') {
            const mastery = sheetMastery(context.sheet);
            if (!mastery || element !== mastery) return false;
        } else if (element !== normalizeSearchText(filter.element)) {
            return false;
        }
    }
    return true;
}

/** Os acréscimos que uma regra faz, com os valores da ficha já lidos (Luta, Foco, LP) */
function specFromExtra(source: string, extra: PassiveExtra, context: PassiveContext, weapon?: WeaponLike): ExtraSpec | null {
    const dice = [ ...(extra.dice ?? []) ];
    let flat = extra.flat ?? 0;
    let sameDie = 0;

    if (extra.sameDie && extra.sameDie > 0) {
        if (weapon) {
            // Uma arma: +N dados do mesmo tipo do primeiro dado da fórmula (dano fixo, sem dado, não ganha nada)
            const die = firstDie(weapon.effect?.value) ?? firstDie(weapon.effect?.critValue);
            if (die) dice.push(`${extra.sameDie}d${die.sides}`);
        } else {
            sameDie = extra.sameDie;
        }
    }

    if (extra.plus === 'Luta') flat += sheetLuta(context.sheet);
    else if (extra.plus === 'attr:foc') flat += sheetFoc(context.sheet);
    else if (extra.plus === 'currentLp') flat += sheetLp(context.sheet).lp;

    if (dice.length === 0 && flat === 0 && sameDie === 0) return null;
    return { source, dice, flat, sameDie };
}

const rulesOf = <K extends PassiveRule['kind']>(passives: readonly PassiveDef[], kind: K): Array<{ passive: PassiveDef; rule: Extract<PassiveRule, { kind: K }> }> =>
    passives.flatMap(passive => (passive.rules ?? []).filter((rule): rule is Extract<PassiveRule, { kind: K }> => rule.kind === kind).map(rule => ({ passive, rule })));

/** O que as passivas somam ao dano da arma que acabou de acertar */
export function weaponDamageSpecs(passives: readonly PassiveDef[], context: PassiveContext, weapon: WeaponLike): ExtraSpec[] {
    const specs: ExtraSpec[] = [];
    for (const { passive, rule } of rulesOf(passives, 'weaponDamage')) {
        if (!weaponMatches(rule.weapon, weapon) || !conditionMet(rule.when, context)) continue;
        const spec = specFromExtra(passive.name, rule.extra, context, weapon);
        if (spec) specs.push(spec);
    }
    return specs;
}

/** O que as passivas somam ao dano ou à cura do efeito da magia (a parte `sameDie` espera os dados do estágio: ver `resolveSpellSpecs`) */
export function spellEffectSpecs(passives: readonly PassiveDef[], context: PassiveContext, spell: SpellLike): ExtraSpec[] {
    const specs: ExtraSpec[] = [];
    for (const { passive, rule } of rulesOf(passives, 'spellEffect')) {
        if (!spellMatches(rule.spell, spell, context) || !conditionMet(rule.when, context)) continue;
        const spec = specFromExtra(passive.name, rule.extra, context);
        if (spec) specs.push(spec);
    }
    return specs;
}

export interface SpellHitExtras {
    /** d20 a mais no teste de magia */
    advantages: number;
    /** Valor fixo somado ao teste */
    flat: number;
    /** De onde vem, para o chat: "Domínio Elemental: +2" */
    notes: string[];
}

/** O que as passivas somam ao **teste de magia** de quem conjura */
export function spellHitExtras(passives: readonly PassiveDef[], context: PassiveContext, spell: SpellLike): SpellHitExtras {
    const result: SpellHitExtras = { advantages: 0, flat: 0, notes: [] };
    for (const { passive, rule } of rulesOf(passives, 'spellHit')) {
        if (!spellMatches(rule.spell, spell, context)) continue;
        if (rule.advantages) {
            result.advantages += rule.advantages;
            result.notes.push(`${passive.name}: vantagem, +${rule.advantages}d20`);
        }
        if (rule.flat) {
            result.flat += rule.flat;
            result.notes.push(`${passive.name}: ${rule.flat > 0 ? '+' : '−'}${Math.abs(rule.flat)}`);
        }
    }
    return result;
}

export interface CritMarginReduction {
    /** Quanto a margem de crítico desce (0 = nada; a margem de 20 com redução 1 fica 19) */
    reduction: number;
    /** De onde vem, para o chat: "Ascensão Arcana: margem −1" */
    notes: string[];
}

type CritScope = 'weapon' | 'spell';

const critScopeMatches = (rule: { scope?: CritScope; spell?: SpellFilter }, scope: CritScope, spell: SpellLike | undefined, context: PassiveContext): boolean => {
    if (rule.scope && rule.scope !== scope) return false;
    return scope === 'spell' && rule.spell && spell ? spellMatches(rule.spell, spell, context) : true;
};

/** O que as passivas baixam da margem de crítico do ataque (arma ou magia): soma das reduções, margem aumentada (`delta` positivo) não existe */
export function critMarginReduction(passives: readonly PassiveDef[], context: PassiveContext, scope: CritScope, spell?: SpellLike): CritMarginReduction {
    const result: CritMarginReduction = { reduction: 0, notes: [] };
    for (const { passive, rule } of rulesOf(passives, 'critMargin')) {
        if (!critScopeMatches(rule, scope, spell, context) || !conditionMet(rule.when, context)) continue;
        const cut = Math.max(0, -Math.trunc(rule.delta));
        if (cut === 0) continue;
        result.reduction += cut;
        result.notes.push(`${passive.name}: margem de crítico −${cut}`);
    }
    return result;
}

/** Os multiplicadores de crítico que as passivas oferecem agora (o maior vence, ver `critMultiplier` de `critical.ts`) */
export function critMultiplierSources(passives: readonly PassiveDef[], context: PassiveContext, scope: CritScope, spell?: SpellLike): number[] {
    return rulesOf(passives, 'critMultiplier')
        .filter(({ rule }) => critScopeMatches(rule, scope, spell, context) && conditionMet(rule.when, context))
        .map(({ rule }) => rule.value);
}

export interface SpellCostAdjustment {
    /** Soma ao custo de MP (negativo reduz) */
    delta: number;
    /** O estágio Maestria do nível 4 não custa o MP extra dele */
    freeMasteryExtra: boolean;
    sources: string[];
}

export function spellCostAdjustment(passives: readonly PassiveDef[]): SpellCostAdjustment {
    const result: SpellCostAdjustment = { delta: 0, freeMasteryExtra: false, sources: [] };
    for (const { passive, rule } of rulesOf(passives, 'spellCost')) {
        result.delta += rule.delta;
        if (rule.freeMasteryExtra) result.freeMasteryExtra = true;
        result.sources.push(passive.name);
    }
    return result;
}

export interface InitiativeAdvantages {
    advantages: number;
    notes: string[];
}

/** As vantagens que as passivas dão à iniciativa (Reflexos Aumentados) */
export function initiativeAdvantages(passives: readonly PassiveDef[]): InitiativeAdvantages {
    const result: InitiativeAdvantages = { advantages: 0, notes: [] };
    for (const { passive, rule } of rulesOf(passives, 'initiative')) {
        result.advantages += rule.advantages;
        result.notes.push(`${passive.name}: vantagem, +${rule.advantages}d20`);
    }
    return result;
}

// ─── Dados que vêm de efeitos de habilidades ativadas ─────────────────────────────────────────────────────────────────────────

const DICE_VALUE = /^\s*\d+\s*d\s*\d+(?:\s*[+-]\s*\d+)?\s*$/i;

/** Os modificadores do nível em que o efeito foi aplicado */
function appliedModifiers(effect: AppliedEffect): Array<{ kind: string; target?: string; value?: number | string }> {
    const levels = effect.snapshot?.levels ?? [];
    const level = levels[(Number(effect.level) || 1) - 1] ?? levels[0];
    return level?.modifiers ?? [];
}

export type DiceScope = 'weapon' | 'spell';

/**
 * Dados extras de dano que os efeitos aplicados ao jogador dão (`damage_dealt_bonus` com valor em dados, como "+1d8": o motor do mestre só entende número, então estes são
 * rolados por quem ataca). O alvo do modificador diz onde vale: `weapon` (qualquer arma), `melee` (arma branca), `spell` (efeito de magia), `any` (arma e magia) e `stealth`
 * (ataque de quem está furtivo ou invisível).
 */
export function effectDamageSpecs(
    effects: readonly AppliedEffect[] | null | undefined,
    context: PassiveContext,
    scope: DiceScope,
    weapon?: WeaponLike
): ExtraSpec[] {
    const specs: ExtraSpec[] = [];
    for (const effect of effects ?? []) {
        const source = String(effect.snapshot?.name ?? 'Efeito');
        for (const modifier of appliedModifiers(effect)) {
            if (modifier.kind !== 'damage_dealt_bonus' || typeof modifier.value !== 'string' || !DICE_VALUE.test(modifier.value)) continue;

            const target = normalizeSearchText(modifier.target) || 'any';
            const applies =
                target === 'any' ||
                (target === 'weapon' && scope === 'weapon') ||
                (target === 'melee' && scope === 'weapon' && (!weapon || isMeleeWeapon(weapon))) ||
                (target === 'spell' && scope === 'spell') ||
                (target === 'stealth' && scope === 'weapon' && Boolean(context.stealthy));
            if (applies) specs.push({ source, dice: [ modifier.value.replace(/\s+/g, '') ], flat: 0, sameDie: 0 });
        }
    }
    return specs;
}

/** Bônus de acerto da arma que os efeitos aplicados dão (`stat_bonus` em `hit`: Ritmo da Batalha) */
export function effectHitBonus(effects: readonly AppliedEffect[] | null | undefined): { flat: number; notes: string[] } {
    let flat = 0;
    const notes: string[] = [];
    for (const effect of effects ?? []) {
        for (const modifier of appliedModifiers(effect)) {
            if ((modifier.kind === 'stat_bonus' || modifier.kind === 'stat_penalty') && normalizeSearchText(modifier.target) === 'hit') {
                const value = Math.abs(Number(modifier.value) || 0) * (modifier.kind === 'stat_penalty' ? -1 : 1);
                if (value === 0) continue;
                flat += value;
                notes.push(`${String(effect.snapshot?.name ?? 'Efeito')}: ${value > 0 ? '+' : '−'}${Math.abs(value)}`);
            }
        }
    }
    return { flat, notes };
}

/**
 * O que os efeitos aplicados baixam da margem de crítico (`stat_bonus` em `critMargin` com valor negativo: Forma Primordial −2). Positivo não faz nada: a margem nunca passa de 20
 * (e um `stat_penalty` de 2 vale −2, como nos outros alvos).
 */
export function effectCritMarginReduction(effects: readonly AppliedEffect[] | null | undefined): CritMarginReduction {
    const result: CritMarginReduction = { reduction: 0, notes: [] };
    for (const effect of effects ?? []) {
        for (const modifier of appliedModifiers(effect)) {
            if ((modifier.kind !== 'stat_bonus' && modifier.kind !== 'stat_penalty') || normalizeSearchText(modifier.target) !== 'critmargin') continue;
            const signed = modifier.kind === 'stat_penalty' ? -Math.abs(Number(modifier.value) || 0) : Number(modifier.value) || 0;
            const cut = Math.max(0, -Math.trunc(signed));
            if (cut === 0) continue;
            result.reduction += cut;
            result.notes.push(`${String(effect.snapshot?.name ?? 'Efeito')}: margem de crítico −${cut}`);
        }
    }
    return result;
}

// ─── Rolar os acréscimos ──────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Rola os acréscimos de dano (arma ou magia). `sameDie` só existe nas magias e precisa do dado do efeito (`die`): +N dados do mesmo tipo. Cada acréscimo vira um segmento do
 * cartão, com a origem no nome ("Armado 1d8"): o chat mostra de onde veio cada pedaço do total.
 */
export function rollSpecs(specs: readonly ExtraSpec[], roll: ExtraRoller, die?: { sides: number } | null): ExtraSegment[] {
    const segments: ExtraSegment[] = [];
    for (const spec of specs) {
        const dice = [ ...spec.dice ];
        if (spec.sameDie > 0 && die) dice.push(`${spec.sameDie}d${die.sides}`);
        if (dice.length === 0 && spec.flat === 0) continue;

        const notation = dice.join('+');
        let total = spec.flat;
        let display = spec.flat !== 0 ? String(spec.flat) : '';

        if (dice.length > 0) {
            const rolled = roll(notation);
            if (!rolled) continue;
            total += rolled.total;
            display = spec.flat !== 0 ? `${rolled.display} + ${spec.flat}` : rolled.display;
        }

        const label = [ notation, spec.flat !== 0 ? `${notation ? '+' : ''}${spec.flat}` : '' ].filter(Boolean).join('');
        segments.push({ source: spec.source, notation: `${spec.source} ${label}`.trim(), display, total });
    }
    return segments;
}

/** Soma os segmentos rolados */
export const sumSegments = (segments: readonly ExtraSegment[]): number => segments.reduce((sum, segment) => sum + segment.total, 0);

// ─── Dano de magia: só o que é dano ou cura recebe acréscimo ──────────────────────────────────────────────────────────────────

const DURATION_AFTER = /^\s*(?:de\s+)?(?:turnos?|rodadas?|minutos?|horas?|segundos?|dias?|metros?|m)\b/i;

/**
 * A expressão de dados do estágio é uma **duração** ("dura 1d4 turnos"), não dano nem cura? Olha o que vem logo depois dela no texto. O catálogo tem no máximo uma expressão de dados
 * por estágio, então uma magia só de duração não ganha acréscimo de dano.
 */
export function isDurationExpression(stageText: string, notation: string): boolean {
    const index = stageText.toLowerCase().indexOf(notation.toLowerCase());
    if (index === -1) return false;
    return DURATION_AFTER.test(stageText.slice(index + notation.length, index + notation.length + 16));
}
