import { parseAmount, type TakenModifier } from './engine/modifiers';
import type { WeaknessProfile } from './engine/weakness';

/**
 * Defesas de uma criatura para o combate automatizado: o elemento dela (`elementalMastery`), as **fraquezas declaradas** e as
 * **resistências e vulnerabilidades** ao dano recebido. Só o mestre cria, edita e vê (o editor de criatura e a janela da criatura são do mestre).
 *
 * Fraquezas: elementos ou tipos de dano físico ("Fogo", "Cortante"); somam-se à fraqueza do elemento dela (`weaknessAgainst`).
 * Resistência/vulnerabilidade: `{ kind, element?, value }`, `value` como no catálogo de efeitos ("25%" ou "3", a magnitude; o `kind` dá o sinal).
 * Sem `element` vale para todo dano; "Físico" vale para qualquer dano físico.
 */

export interface DamageModifierData {
    kind: 'resistance' | 'vulnerability';
    /** Elemento ou tipo de dano ("Fogo", "Cortante"), ou "Físico"; vazio = todo dano */
    element?: string;
    /** "25%" (percentual) ou "3" (fixo) */
    value: string;
}

/** Tipos de dano físico: não têm tabela de fraqueza, só valem se declarados */
export const PHYSICAL_DAMAGE_TYPES = [ 'Cortante', 'Perfurante', 'Impactante' ] as const;

/** Um valor "Físico" cobre os três tipos físicos nas resistências */
export const PHYSICAL_ANY = 'Físico';

export const MAX_DEFENSE_ENTRIES = 20;
const MAX_NAME_LENGTH = 40;

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** `0 * -1` seria -0 */
const signed = (value: number, sign: 1 | -1): number => (value === 0 ? 0 : value * sign);

const asName = (value: unknown): string => (typeof value === 'string' ? value.trim().slice(0, MAX_NAME_LENGTH) : '');

/** Fraquezas declaradas limpas: texto, sem repetir (sem caixa nem acento), até 20 */
export function sanitizeWeaknesses(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];

    const seen = new Set<string>();
    const result: string[] = [];
    for (const entry of raw) {
        const name = asName(entry);
        const key = normalize(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        result.push(name);
        if (result.length >= MAX_DEFENSE_ENTRIES) break;
    }
    return result;
}

/** Resistências e vulnerabilidades limpas: só `kind` válido e valor numérico ou percentual maior que zero, até 20 */
export function sanitizeDamageModifiers(raw: unknown): DamageModifierData[] {
    if (!Array.isArray(raw)) return [];

    const result: DamageModifierData[] = [];
    for (const entry of raw) {
        if (typeof entry !== 'object' || entry === null) continue;
        const { kind, element, value } = entry as Record<string, unknown>;
        if (kind !== 'resistance' && kind !== 'vulnerability') continue;

        const amount = parseAmount(typeof value === 'number' ? value : asName(value));
        if (!amount || (amount.pct === 0 && amount.flat === 0)) continue;

        const name = asName(element);
        const text = typeof value === 'number' ? String(Math.abs(value)) : asName(value).replace(/^[+-]\s*/, '');
        result.push({ kind, ...(name ? { element: name } : {}), value: text });
        if (result.length >= MAX_DEFENSE_ENTRIES) break;
    }
    return result;
}

interface DefenseSource {
    elementalMastery?: unknown;
    weaknesses?: unknown;
    damageModifiers?: unknown;
}

/** O que o motor precisa para a fraqueza elemental da criatura (`weaknessAgainst`) */
export function creatureWeaknessProfile(creature: DefenseSource | null | undefined): WeaknessProfile {
    return { element: creature?.elementalMastery, weaknesses: sanitizeWeaknesses(creature?.weaknesses) };
}

/** As resistências e vulnerabilidades da criatura no formato do motor (`computeDamage`/`resolveAttack`: `taken`) */
export function creatureTakenModifiers(creature: DefenseSource | null | undefined): TakenModifier[] {
    return sanitizeDamageModifiers(creature?.damageModifiers).flatMap((modifier): TakenModifier[] => {
        const amount = parseAmount(modifier.value);
        if (!amount) return [];
        const element = normalize(modifier.element);
        // No motor o sinal já vem aplicado: resistência reduz o dano recebido (negativo), vulnerabilidade aumenta (positivo)
        const sign = modifier.kind === 'resistance' ? -1 : 1;
        return [ { kind: modifier.kind, pct: signed(amount.pct, sign), flat: signed(amount.flat, sign), ...(element ? { element } : {}) } ];
    });
}

/** "Resistência a Fogo: 25%", "Vulnerabilidade a todo dano: 3" */
export function describeDamageModifier(modifier: DamageModifierData): string {
    const label = modifier.kind === 'resistance' ? 'Resistência' : 'Vulnerabilidade';
    const target = modifier.element ? `a ${modifier.element}` : 'a todo dano';
    return `${label} ${target}: ${modifier.value}`;
}

/** A criatura tem alguma defesa declarada (para a tela decidir se mostra o bloco) */
export function hasDeclaredDefenses(creature: DefenseSource | null | undefined): boolean {
    return Boolean(normalize(creature?.elementalMastery)) || sanitizeWeaknesses(creature?.weaknesses).length > 0 || sanitizeDamageModifiers(creature?.damageModifiers).length > 0;
}
