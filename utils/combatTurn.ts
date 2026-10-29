import type { Combat } from '@models';

/** Quem pode estar em turno: a ficha do jogador (o combatente guarda o id da ficha ou o do usuário) */
interface TurnSubject {
    id: string;
    userId: string;
}

/**
 * Combate ativo, fase de ação: o combatente da vez é o desta ficha?
 * Usado no cartão do jogador e na barra do grupo do mestre para o destaque "Em turno".
 */
export function isCombatantInTurn(
    combat: Pick<Combat, 'isActive' | 'phase' | 'combatants' | 'currentTurnIndex'> | null | undefined,
    sheet: TurnSubject
): boolean {
    if (!combat?.isActive || combat.phase !== 'ACTION') return false;

    const current = combat.combatants?.[combat.currentTurnIndex];
    if (!current) return false;

    return current.id === sheet.id || Boolean(current.odacId && current.odacId === sheet.userId);
}
