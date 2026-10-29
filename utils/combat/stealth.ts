import type { AppliedEffect, Combat } from '@models';
import { normalizeSearchText } from '@utils/searchText';

/**
 * Efeito FURTIVO (regra do dono): quem ataca com arma estando furtivo rola 1d20 a mais no teste de acerto (vantagem: vale o maior) e, se der
 * dano, o dano é dobrado. Só vale para ataque com arma (a magia não muda) e só em combate ativo, onde o efeito existe.
 */
export const STEALTH_EXTRA_D20 = 1;
export const STEALTH_DAMAGE_MULTIPLIER = 2;

/** O efeito é o "Furtivo" (pelo nome do efeito, sem caixa nem acento, ou pelo id do catálogo `seed-furtivo`) */
export function isStealthEffect(effect: Pick<AppliedEffect, 'effectId' | 'snapshot'>): boolean {
    return normalizeSearchText(effect.snapshot?.name) === 'furtivo' || normalizeSearchText(effect.effectId).endsWith('furtivo');
}

export function hasStealthEffect(effects: ReadonlyArray<AppliedEffect> | null | undefined): boolean {
    return (effects ?? []).some(isStealthEffect);
}

/** O combatente (a ficha, pelo id) está furtivo agora? Fora de combate ativo não há efeito, então não */
export function isCombatantStealthy(combat: Pick<Combat, 'isActive' | 'combatants'> | null | undefined, combatantId: string | null | undefined): boolean {
    if (!combat?.isActive || !combatantId) return false;
    return hasStealthEffect(combat.combatants?.find(combatant => combatant.id === combatantId)?.effects);
}
