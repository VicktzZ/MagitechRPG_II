import type { Combatant, Creature } from '@models';
import { vitalCeiling } from './combat/effectStats';
import { collectModifiers } from './combat/engine/modifiers';
import { applyVitalDelta, type VitalDeltas } from './vitals';

/** Pontos vitais que o combate guarda para uma criatura: só vida e mana (a armadura não é do combatente) */
export const COMBATANT_VITAL_KEYS = [ 'lp', 'mp' ] as const;

export type CombatantVitalKey = typeof COMBATANT_VITAL_KEYS[number];

export interface CombatantVitals {
    lp: number;
    maxLp: number;
    mp: number;
    maxMp: number;
}

export type CombatantVitalChange = Partial<Record<CombatantVitalKey, { before: number; after: number }>>;

type VitalSource = Pick<Combatant, 'currentLp' | 'maxLp' | 'currentMp' | 'maxMp'>;
type BaseStats = Partial<Record<'lp' | 'maxLp' | 'mp' | 'maxMp', unknown>>;

const asNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Vida e mana de um combatente como o combate as vê. O combatente guarda o que mudou durante a luta; o que ele ainda não
 * guarda (criatura que entrou no meio do combate não leva mana, por exemplo) vem da criatura de origem, e na falta dela é zero.
 * É a mesma conta da tela e do servidor, para o que o mestre vê ser o que o servidor soma.
 */
export function combatantVitals(combatant: VitalSource, creature?: { stats?: BaseStats } | null): CombatantVitals {
    const stats = creature?.stats;

    const lp = asNumber(combatant.currentLp) ?? asNumber(stats?.lp) ?? 0;
    const mp = asNumber(combatant.currentMp) ?? asNumber(stats?.mp) ?? 0;

    return {
        lp,
        maxLp: asNumber(combatant.maxLp) ?? asNumber(stats?.maxLp) ?? asNumber(stats?.lp) ?? 0,
        mp,
        maxMp: asNumber(combatant.maxMp) ?? asNumber(stats?.maxMp) ?? asNumber(stats?.mp) ?? 0
    };
}

/**
 * Soma as variações à vida e à mana de um combatente (dano para em zero, cura para no máximo de agora, quem está acima do máximo
 * não perde nada ao ser curado: `applyVitalDelta`). Devolve o combatente novo e o que mudou, sem alterar o original.
 * Só os pontos vitais ajustados são gravados no combatente (atual e máximo, para o valor de origem não se perder).
 */
export function applyCombatantDeltas<T extends Combatant>(
    combatant: T,
    creature: Creature | null | undefined,
    deltas: VitalDeltas
): { combatant: T; changes: CombatantVitalChange } {
    const vitals = combatantVitals(combatant, creature);
    const next: T = { ...combatant };
    const changes: CombatantVitalChange = {};
    // O teto da cura é o de agora: Fragilidade baixa o máximo, Sobrecura e Sobremana deixam passar dele (o máximo gravado no combatente não muda)
    const modifiers = collectModifiers(combatant.effects);

    if (deltas.lp !== undefined) {
        const after = applyVitalDelta(vitals.lp, vitalCeiling(vitals.maxLp, modifiers, 'lp'), deltas.lp);
        changes.lp = { before: vitals.lp, after };
        next.currentLp = after;
        next.maxLp = vitals.maxLp;
    }

    if (deltas.mp !== undefined) {
        const after = applyVitalDelta(vitals.mp, vitalCeiling(vitals.maxMp, modifiers, 'mp'), deltas.mp);
        changes.mp = { before: vitals.mp, after };
        next.currentMp = after;
        next.maxMp = vitals.maxMp;
    }

    return { combatant: next, changes };
}
