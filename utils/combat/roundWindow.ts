import type { Combatant } from '@models';
import { resetActionBudgets } from './actionBudgets';
import { resetMpLimitWindows } from './mpLimitWindow';

/**
 * A rodada de combate virou (ou o combate acabou): o limite de MP por turno e as ações (Padrão, Bônus, Movimento e Reação) de todos
 * recomeçam. Um lugar só para as viradas da rota `combat`.
 */
export function resetRoundWindows(combatants: Combatant[] | undefined): void {
    resetMpLimitWindows(combatants);
    resetActionBudgets(combatants);
}
