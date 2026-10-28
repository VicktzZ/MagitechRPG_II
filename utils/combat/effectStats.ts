import type { AppliedEffect, Combat } from '@models';
import { combatantEffects } from './effectDice';
import { collectModifiers, modifiedStat, overflowFor, statShift, type Amount, type ModifierSet } from './engine/modifiers';

/**
 * Estatísticas dos efeitos aplicados (Fase 6.3; catálogo `CombatEffect`: `stat_bonus`/`stat_penalty` em `displacement`, `initiative`, `ap` e `maxLp`, e
 * `overflow_stat` em `lp` e `mp`). Os efeitos **não gravam nada** na ficha nem na criatura: o valor "de agora" é sempre derivado (base + efeitos aplicados), então tirar
 * o efeito devolve o número de antes sem ninguém precisar desfazer. Vale só com o combate ativo (fora dele os efeitos não existem).
 *
 *  - **LP/MP máximo** (`maxLp`, `maxMp`): o teto da cura e a escala das barras. O LP/MP **atual não é cortado** quando o máximo cai (Fragilidade): ele só deixa de subir;
 *  - **Sobrecura e Sobremana** (`overflow`): a cura e a recuperação podem passar do máximo até `máximo efetivo × (1 + %)`, arredondado para baixo;
 *  - **Iniciativa**: o bônus fixo soma ao total da iniciativa rolada;
 *  - **Deslocamento** e **AP**: o valor efetivo é mostrado (o AP já entrava na conta do acerto, `attackProposal`); o app não valida movimento, o mapa é de terceiros.
 */

export type VitalPool = 'lp' | 'mp';

const MAX_STAT: Record<VitalPool, 'maxLp' | 'maxMp'> = { lp: 'maxLp', mp: 'maxMp' };

const finite = (value: unknown): number | null => {
    const parsed = Number(value);
    return value !== null && value !== undefined && value !== '' && Number.isFinite(parsed) ? parsed : null;
};

/** O máximo de LP ou MP depois dos efeitos (Fragilidade...), em inteiro; sem efeito sobre ele, o máximo como veio */
export function effectiveMaxVital(base: unknown, set: ModifierSet, pool: VitalPool): number {
    const max = finite(base) ?? 0;
    const modified = modifiedStat(set, MAX_STAT[pool], max);
    return modified === max ? max : Math.floor(modified);
}

/** Até onde a cura ou a recuperação sobe: o máximo efetivo, mais a margem de Sobrecura/Sobremana (arredondada para baixo) */
export function vitalCeiling(base: unknown, set: ModifierSet, pool: VitalPool): number {
    const max = effectiveMaxVital(base, set, pool);
    const over = overflowFor(set, pool);
    return over > 0 ? Math.floor(max * (1 + over / 100)) : max;
}

/** O bônus (ou penalidade) fixo de iniciativa dos efeitos, em inteiro */
export const initiativeEffectBonus = (set: ModifierSet): number => Math.round(statShift(set, 'initiative'));

/** O deslocamento em metros depois dos efeitos (Velocidade, Congelamento...), com até 2 casas */
export const displacementWithEffects = (base: unknown, set: ModifierSet): number => modifiedStat(set, 'displacement', finite(base) ?? 0);

/** O AP depois dos efeitos (Eletrização...), nunca abaixo de zero */
export const apWithEffects = (base: unknown, set: ModifierSet): number => modifiedStat(set, 'ap', finite(base) ?? 0);

/** O teto de LP e de MP de um combatente a partir dos máximos de origem (ficha ou criatura); `null` onde não há máximo conhecido */
export function combatantCeilings(
    combat: Pick<Combat, 'isActive' | 'combatants'> | null | undefined,
    combatantId: string | null | undefined,
    maxima: { maxLp?: unknown; maxMp?: unknown }
): Partial<Record<VitalPool, number>> {
    const effects = combatantEffects(combat, combatantId);
    if (effects.length === 0) return {};

    const set = collectModifiers(effects);
    const ceilings: Partial<Record<VitalPool, number>> = {};
    if (finite(maxima.maxLp) !== null) ceilings.lp = vitalCeiling(maxima.maxLp, set, 'lp');
    if (finite(maxima.maxMp) !== null) ceilings.mp = vitalCeiling(maxima.maxMp, set, 'mp');
    return ceilings;
}

// ─────────────────────────────────────────────
// O que mostrar: cada estatística que algum efeito mudou, com a origem
// ─────────────────────────────────────────────

export type StatChangeKey = 'displacement' | 'initiative' | 'ap' | 'maxLp' | 'maxMp' | 'overflowLp' | 'overflowMp';

export interface StatChange {
    key: StatChangeKey;
    /** "Deslocamento", "AP", "LP máximo"... */
    label: string;
    /** O valor dito em texto: "9 m → 11,25 m", "+2", "40 → 36", "até 60 (+50%)" */
    text: string;
    /** O efeito aumenta (bom) ou diminui (ruim) o número; a sobrecura conta como aumento */
    direction: 'up' | 'down';
    /** Os efeitos que causam a mudança, sem repetir ("Velocidade", "Fragilidade e Necrose") */
    sources: string[];
}

/** Os valores de origem (ficha ou criatura) que o texto da mudança compara; sem o valor, o texto diz só o que o efeito dá ("-2") */
export interface StatBases {
    displacement?: unknown;
    ap?: unknown;
    maxLp?: unknown;
    maxMp?: unknown;
}

const effectName = (effect: AppliedEffect): string => String(effect.snapshot?.name ?? 'Efeito').trim() || 'Efeito';

/** Até 2 casas, vírgula decimal ("11,25") */
function format(value: number): string {
    return String(Math.round(value * 100) / 100).replace('.', ',');
}

const signed = (value: number): string => `${value > 0 ? '+' : value < 0 ? '−' : ''}${format(Math.abs(value))}`;

/** Os nomes dos efeitos aplicados que mexem numa estatística, sem repetir */
function sourcesOf(effects: readonly AppliedEffect[], touches: (set: ModifierSet) => boolean): string[] {
    const names: string[] = [];
    for (const effect of effects) {
        const name = effectName(effect);
        if (touches(collectModifiers([ effect ])) && !names.includes(name)) names.push(name);
    }
    return names;
}

/** "−50%" e/ou "−2 m": o que o efeito dá, quando não se sabe o valor de origem para comparar */
function describeDelta(delta: Amount, unit: string): string {
    return [ delta.pct !== 0 ? `${signed(delta.pct)}%` : '', delta.flat !== 0 ? `${signed(delta.flat)}${unit}` : '' ].filter(Boolean).join(' ');
}

/** A ordem em que as estatísticas aparecem na tela */
const STAT_ORDER: readonly StatChangeKey[] = [ 'displacement', 'initiative', 'ap', 'maxLp', 'maxMp', 'overflowLp', 'overflowMp' ];

/** Cada estatística com valor de origem: o nome no motor (`set.stats`, em minúsculas), o rótulo, a unidade e como o valor de agora é calculado */
const BASED_STATS = [
    { key: 'displacement', stat: 'displacement', label: 'Deslocamento', unit: ' m', now: (base: number, set: ModifierSet): number => displacementWithEffects(base, set) },
    { key: 'ap', stat: 'ap', label: 'AP', unit: '', now: (base: number, set: ModifierSet): number => apWithEffects(base, set) },
    { key: 'maxLp', stat: 'maxlp', label: 'LP máximo', unit: '', now: (base: number, set: ModifierSet): number => effectiveMaxVital(base, set, 'lp') },
    { key: 'maxMp', stat: 'maxmp', label: 'MP máximo', unit: '', now: (base: number, set: ModifierSet): number => effectiveMaxVital(base, set, 'mp') }
] as const;

/**
 * As estatísticas que os efeitos aplicados mudam agora, na ordem da tela. Só entram as que mudaram. Cada uma traz o texto ("AP 8 → 6"), se é ganho ou perda
 * e quais efeitos a causam, para a tela e a dica dizerem de onde vem.
 */
export function statChanges(effects: readonly AppliedEffect[] | null | undefined, bases: StatBases = {}): StatChange[] {
    const list = effects ?? [];
    if (list.length === 0) return [];

    const set = collectModifiers(list);
    const found: Partial<Record<StatChangeKey, StatChange>> = {};

    for (const { key, stat, label, unit, now } of BASED_STATS) {
        const delta = set.stats[stat];
        if (!delta || (delta.pct === 0 && delta.flat === 0)) continue;

        const base = finite(bases[key]);
        found[key] = {
            key,
            label,
            text: base !== null ? `${format(base)}${unit} → ${format(now(base, set))}${unit}` : describeDelta(delta, unit),
            direction: delta.pct + delta.flat > 0 ? 'up' : 'down',
            sources: sourcesOf(list, each => Boolean(each.stats[stat]))
        };
    }

    const bonus = initiativeEffectBonus(set);
    if (bonus !== 0) {
        found.initiative = { key: 'initiative', label: 'Iniciativa', text: signed(bonus), direction: bonus > 0 ? 'up' : 'down', sources: sourcesOf(list, each => Boolean(each.stats['initiative'])) };
    }

    for (const [ pool, key, label ] of [ [ 'lp', 'overflowLp', 'LP acima do máximo' ], [ 'mp', 'overflowMp', 'MP acima do máximo' ] ] as const) {
        const over = overflowFor(set, pool);
        if (over <= 0) continue;
        const base = finite(bases[pool === 'lp' ? 'maxLp' : 'maxMp']);
        found[key] = {
            key,
            label,
            text: base !== null ? `até ${vitalCeiling(base, set, pool)} (+${format(over)}%)` : `+${format(over)}%`,
            direction: 'up',
            sources: sourcesOf(list, each => overflowFor(each, pool) > 0)
        };
    }

    return STAT_ORDER.flatMap(key => found[key] ?? []);
}
