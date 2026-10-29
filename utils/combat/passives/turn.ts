import { conditionMet, sheetLp, type PassiveContext } from './owned';
import type { PassiveDef } from './types';

/**
 * O que as passivas fazem **no começo do turno** do personagem e **ao entrar em furtividade**. A rota do combate aplica (regenera LP, dá ações extras) e avisa no log.
 */

export interface RegenPlan {
    source: string;
    /** Dado da regeneração ("1d6") */
    dice: string;
    /** Quanto de LP ainda cabe até o teto da regra (a regeneração para ali) */
    room: number;
}

/** As regenerações que valem agora: a condição bate e o LP ainda está abaixo do teto (em % do máximo) */
export function regenPlans(passives: readonly PassiveDef[], context: PassiveContext): RegenPlan[] {
    const { lp, maxLp } = sheetLp(context.sheet);
    const plans: RegenPlan[] = [];

    for (const passive of passives) {
        for (const rule of passive.rules ?? []) {
            if (rule.kind !== 'turnRegen' || !conditionMet(rule.when, context)) continue;
            const ceiling = Math.floor((maxLp * rule.untilPct) / 100);
            const room = ceiling - lp;
            if (maxLp > 0 && room > 0) plans.push({ source: passive.name, dice: rule.dice, room });
        }
    }
    return plans;
}

export interface ActionGrant {
    source: string;
    padrao: number;
    movimento: number;
}

/**
 * As ações extras de quem é furtivo (Disfarce: +1 Padrão ao entrar em furtividade no turno; Ligeireza: +2 Movimento no começo do turno). Sem furtividade não há nada.
 */
export function stealthGrants(passives: readonly PassiveDef[], on: 'enter' | 'turnStart', context: PassiveContext): ActionGrant[] {
    if (!context.stealthy) return [];
    const grants: ActionGrant[] = [];

    for (const passive of passives) {
        for (const rule of passive.rules ?? []) {
            if (rule.kind !== 'stealthActions' || rule.on !== on) continue;
            grants.push({ source: passive.name, padrao: rule.add.padrao ?? 0, movimento: rule.add.movimento ?? 0 });
        }
    }
    return grants;
}

interface CombatLike {
    round?: number | null;
    phase?: string | null;
    combatants?: ReadonlyArray<{ id: string; hasActed?: boolean | null }> | null;
}

/**
 * O alvo ainda não agiu no combate (Ataque Calculado): só na primeira rodada, na fase de ação, e o alvo está no combate e ainda não passou o turno. Sem alvo escolhido não vale.
 */
export function targetHasNotActed(combat: CombatLike | null | undefined, targetId: string | null | undefined): boolean {
    if (!combat || !targetId || combat.round !== 1 || combat.phase !== 'ACTION') return false;
    const target = combat.combatants?.find(candidate => candidate.id === targetId);
    return Boolean(target) && !target?.hasActed;
}
