import type { AppliedEffect, CombatEffectLevel, CombatEffectModifier } from '@models';

/**
 * Lê os modificadores estruturados dos efeitos aplicados (catálogo `CombatEffect`) e os junta num conjunto que o motor consome.
 * Até aqui eles só apareciam na tela; este é o ponto que os transforma em regra.
 *
 * Valores do catálogo: número ("2"), com sinal ("+5", "-1") ou percentual ("-25%", "+100%"). O sinal do `kind` manda: resistência e penalidade
 * reduzem, vulnerabilidade e bônus aumentam, qualquer que seja o sinal escrito.
 */

export interface Amount {
    pct: number;
    flat: number;
}

/** Resistência (reduz) ou vulnerabilidade (aumenta) ao dano recebido; sem `element`, vale para todo dano */
export interface TakenModifier extends Amount {
    kind: 'resistance' | 'vulnerability';
    element?: string;
}

export interface ModifierSet {
    /** Vantagens e desvantagens por alvo do teste: 'attack', 'dodge', 'perception', 'stealth', 'initiative'... */
    advantage: Record<string, number>;
    disadvantage: Record<string, number>;
    /** Dano que quem tem o efeito causa a mais ou a menos */
    dealt: Amount;
    /** Dano que quem tem o efeito recebe a menos (resistência) ou a mais (vulnerabilidade) */
    taken: TakenModifier[];
    /** Bônus e penalidades de estatística: 'ap', 'displacement', 'initiative', 'maxLp'... */
    stats: Record<string, Amount>;
    /** Marcadores: invisible, stealth, true_sight, dim_vision, terrain_immunity, skip_turn, no_actions, no_spells, no_healing. O valor é o texto do catálogo ou `true` */
    flags: Record<string, string | true>;
    /** Quanto o LP/MP pode passar do máximo (sobrecura e sobremana), em % */
    overflow: Record<string, number>;
}

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** "-25%" → { pct: 25 }, "+5" → { flat: 5 }, 2 → { flat: 2 }; a magnitude, sem sinal. `null` se não é número */
export function parseAmount(value: unknown): Amount | null {
    if (typeof value === 'number') return Number.isFinite(value) ? { pct: 0, flat: Math.abs(value) } : null;
    if (typeof value !== 'string') return null;
    const text = value.trim().replace(',', '.');
    const percent = /^[+-]?(\d+(?:\.\d+)?)\s*%$/.exec(text);
    if (percent) return { pct: Number(percent[1]), flat: 0 };
    const plain = /^[+-]?(\d+(?:\.\d+)?)$/.exec(text);
    return plain ? { pct: 0, flat: Number(plain[1]) } : null;
}

// `0 * -1` seria -0 (aparece nos testes e nas contas); zero fica zero
const times = (value: number, sign: 1 | -1): number => (value === 0 ? 0 : value * sign);
const scale = (amount: Amount, sign: 1 | -1): Amount => ({ pct: times(amount.pct, sign), flat: times(amount.flat, sign) });
const add = (a: Amount, b: Amount): Amount => ({ pct: a.pct + b.pct, flat: a.flat + b.flat });

export const emptyModifiers = (): ModifierSet => ({
    advantage: {},
    disadvantage: {},
    dealt: { pct: 0, flat: 0 },
    taken: [],
    stats: {},
    flags: {},
    overflow: {}
});

/** Os modificadores do nível em que o efeito foi aplicado */
function levelModifiers(applied: Pick<AppliedEffect, 'level' | 'snapshot'>): CombatEffectModifier[] {
    const levels: CombatEffectLevel[] = applied.snapshot?.levels ?? [];
    const config = levels[(Number(applied.level) || 1) - 1] ?? levels.find(candidate => candidate.level === applied.level) ?? levels[0];
    return config?.modifiers ?? [];
}

export function addModifier(set: ModifierSet, modifier: Pick<CombatEffectModifier, 'kind' | 'target' | 'value' | 'element'>): void {
    const target = normalize(modifier.target);
    const amount = parseAmount(modifier.value);

    switch (modifier.kind) {
    case 'advantage':
        set.advantage[target || 'attack'] = (set.advantage[target || 'attack'] ?? 0) + 1;
        break;
    case 'disadvantage':
        set.disadvantage[target || 'attack'] = (set.disadvantage[target || 'attack'] ?? 0) + 1;
        break;
    case 'damage_dealt_bonus':
        if (amount) set.dealt = add(set.dealt, scale(amount, 1));
        break;
    case 'damage_dealt_penalty':
        if (amount) set.dealt = add(set.dealt, scale(amount, -1));
        break;
    case 'damage_resistance':
    case 'damage_vulnerability':
        if (amount) {
            const sign = modifier.kind === 'damage_resistance' ? -1 : 1;
            const element = normalize(modifier.element);
            set.taken.push({ kind: sign === -1 ? 'resistance' : 'vulnerability', ...scale(amount, sign), ...(element ? { element } : {}) });
        }
        break;
    case 'stat_bonus':
    case 'stat_penalty':
        if (amount && target) {
            const sign = modifier.kind === 'stat_bonus' ? 1 : -1;
            set.stats[target] = add(set.stats[target] ?? { pct: 0, flat: 0 }, scale(amount, sign));
        }
        break;
    case 'overflow_stat':
        if (amount && target) set.overflow[target] = Math.max(set.overflow[target] ?? 0, amount.pct);
        break;
    case 'flag':
        if (target) set.flags[target] = typeof modifier.value === 'string' && modifier.value ? modifier.value : true;
        break;
    case 'skip_turn':
    case 'no_actions':
    case 'no_spells':
    case 'no_healing':
        set.flags[modifier.kind] = true;
        break;
    default:
        break;
    }
}

/** Junta os modificadores de todos os efeitos aplicados a um combatente (a magia sustentada não traz modificadores) */
export function collectModifiers(effects: readonly AppliedEffect[] | null | undefined): ModifierSet {
    const set = emptyModifiers();
    for (const applied of effects ?? []) {
        for (const modifier of levelModifiers(applied)) addModifier(set, modifier);
    }
    return set;
}

export const advantagesFor = (set: ModifierSet, target: string): number => set.advantage[normalize(target)] ?? 0;
export const disadvantagesFor = (set: ModifierSet, target: string): number => set.disadvantage[normalize(target)] ?? 0;
export const hasFlag = (set: ModifierSet, flag: string): boolean => normalize(flag) in set.flags;

/** O valor de uma estatística depois dos bônus e penalidades (percentuais sobre a base, depois os fixos), com até 2 casas; nunca abaixo de zero */
export function modifiedStat(set: ModifierSet, stat: string, base: number): number {
    const delta = set.stats[normalize(stat)];
    if (!delta) return base;
    return Math.max(0, Math.round((base + (base * delta.pct) / 100 + delta.flat) * 100) / 100);
}

/**
 * Quanto os efeitos mudam uma estatística (negativo = perda), com até 2 casas e **sem** o piso em zero de `modifiedStat`: serve a bônus que se soma a uma rolagem
 * (a iniciativa), onde a base é zero e uma penalidade tem de poder ficar negativa.
 */
export function statShift(set: ModifierSet, stat: string, base: number = 0): number {
    const delta = set.stats[normalize(stat)];
    if (!delta) return 0;
    const shift = Math.round(((base * delta.pct) / 100 + delta.flat) * 100) / 100;
    return shift === 0 ? 0 : shift;
}

/** Quanto o ponto vital ('lp', 'mp') pode passar do máximo por efeito (sobrecura e sobremana), em % do máximo; 0 se nenhum efeito deixa */
export const overflowFor = (set: ModifierSet, stat: string): number => set.overflow[normalize(stat)] ?? 0;
