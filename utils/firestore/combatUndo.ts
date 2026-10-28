import { CombatLog, type Combat } from '@models';
import { describeConflicts, findConflicts, revertChanges, snapshotCombat } from '@utils/combat/history';
import { findSheetConflicts, restoreSheetStats, type CombatEvent } from './combatEvents';

export type UndoOutcome =
    | { ok: true; log: CombatLog }
    | { ok: false; conflicts: string[] };

/**
 * Desfaz um evento do histórico: devolve ao combate (e à vida e mana das fichas) só o que o evento mudou. Se algum desses campos já mudou de
 * novo depois, não faz nada e devolve a lista de conflitos, a não ser que `force` mande sobrescrever. Mexe em `combat` (o chamador salva) e
 * devolve a linha do log "o mestre desfez..."; os logs e o chat de antes ficam como estão, e as estatísticas da campanha não voltam.
 * A linha do log (que vira mensagem no chat de todos) **não traz os valores**: vida e mana dos alvos são do mestre; o que mudou fica só no
 * histórico, que só o mestre lê.
 */
export async function undoCombatEvent(combat: Combat, event: CombatEvent, force: boolean): Promise<UndoOutcome> {
    const names: Record<string, string> = {};
    for (const change of event.changes) {
        if (change.scope === 'combatant') names[change.id] = String(change.before?.['name'] ?? change.after?.['name'] ?? '');
    }
    for (const combatant of combat.combatants ?? []) names[combatant.id] = combatant.name;

    const combatConflicts = findConflicts(snapshotCombat(combat), event.changes);
    const sheetConflicts = await findSheetConflicts(event.sheets);
    if ((combatConflicts.length > 0 || sheetConflicts.length > 0) && !force) {
        return { ok: false, conflicts: describeConflicts(combatConflicts, names, sheetConflicts) };
    }

    revertChanges(combat, event.changes);
    await restoreSheetStats(event.sheets);

    return {
        ok: true,
        log: new CombatLog({
            round: combat.round,
            type: 'action',
            actorId: 'gm',
            actorName: 'Mestre',
            message: `↩️ O mestre desfez: **${event.label}**.`
        })
    };
}
