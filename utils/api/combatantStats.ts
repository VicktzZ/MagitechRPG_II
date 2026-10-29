import { COMBATANT_VITAL_KEYS } from '@utils/combatantVitals';
import type { VitalDeltas } from '@utils/vitals';
import { assertVitalDeltas } from './charsheetStats';
import { assertId } from './input';

/**
 * Corpo de POST /api/campaign/[id]/combat/vitals: `{ combatantId, lp?: n, mp?: n }`, com variações inteiras (negativo =
 * dano ou gasto). Só vida e mana: a criatura em combate não tem armadura própria. Devolve o combatente e só as variações
 * válidas e diferentes de zero, ou lança 400.
 */
export function assertCombatantVitalsBody(body: unknown): { combatantId: string; deltas: VitalDeltas } {
    const deltas = assertVitalDeltas(body, { allowed: COMBATANT_VITAL_KEYS, extraKeys: [ 'combatantId' ] });
    const combatantId = assertId((body as Record<string, unknown>)['combatantId'], 'combatantId');

    return { combatantId, deltas };
}
