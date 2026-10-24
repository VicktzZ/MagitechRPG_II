import type { Combatant } from '@models';

/**
 * Janela do limite de MP por turno (`utils/mpLimit.ts`): vale **por rodada de combate**. O MP gasto em magias começa em 0 e a
 * liberação do limite pelo mestre acaba quando a rodada vira (todos os presentes no combate passaram o turno) e quando o
 * combate termina. Nada disso existe fora do combate: sem combate ativo ninguém gasta nem acumula limite.
 */
export function resetMpLimitWindows(combatants: Combatant[] | undefined): void {
    for (const combatant of combatants ?? []) {
        combatant.mpSpentThisTurn = 0;
        combatant.mpLimitOverride = false;
    }
}
