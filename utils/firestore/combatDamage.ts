import type { Combat, Combatant } from '@models';
import type { StatsEntry } from '@utils/campaignStatsHelper';
import { adminGetDoc, adminUpdateDoc } from './adminDocs';

/**
 * Dano e cura em combatente, por um lugar só (a ação `apply_damage`/`apply_heal` do diálogo de combate e a `resolve_attack` do ataque assistido).
 * Mexe no LP do combatente; se é jogador, grava o LP na ficha **só no campo `stats.lp`** (antes regravava a ficha inteira a partir de uma leitura,
 * o que apagava uma edição simultânea da ficha).
 */

export interface LpChange {
    target: Combatant;
    oldLp: number;
}

async function writeSheetLp(target: Combatant): Promise<void> {
    if (target.type !== 'player') return;
    if (!await adminGetDoc('charsheets', target.id)) return;
    await adminUpdateDoc('charsheets', target.id, { 'stats.lp': target.currentLp });
}

/** O alvo perde `damage` de LP (nunca abaixo de zero); `null` se ele não está no combate */
export async function damageCombatant(combat: Combat, targetId: string, damage: number): Promise<LpChange | null> {
    const target = combat.combatants.find(combatant => combatant.id === targetId);
    if (!target) return null;

    const oldLp = target.currentLp || 0;
    target.currentLp = Math.max(0, oldLp - damage);
    await writeSheetLp(target);
    return { target, oldLp };
}

/** O alvo recupera `heal` de LP até o máximo; cura nunca reduz o LP (jogador com LP acima do máximo por sobrecura); `null` se ele não está no combate */
export async function healCombatant(combat: Combat, targetId: string, heal: number): Promise<LpChange | null> {
    const target = combat.combatants.find(combatant => combatant.id === targetId);
    if (!target) return null;

    const oldLp = target.currentLp || 0;
    const maxLp = target.maxLp || 999;
    target.currentLp = Math.max(oldLp, Math.min(maxLp, oldLp + heal));
    await writeSheetLp(target);
    return { target, oldLp };
}

/** As estatísticas da campanha de um dano (o recebido por jogador, o causado por jogador ou pelo mestre, nocautes e abates) */
export function damageStats(attacker: Combatant | undefined, change: LpChange, damage: number): StatsEntry[] {
    const { target, oldLp } = change;
    const wasDowned = oldLp > 0 && target.currentLp === 0;
    const entries: StatsEntry[] = [];

    if (target.type === 'player') {
        const inc: Record<string, number> = { 'combat.damageTaken': damage };
        if (wasDowned) inc['combat.knockouts'] = 1;
        entries.push({ charsheetId: target.id, userId: target.odacId, charsheetName: target.name, inc });
    }

    if (attacker?.type === 'player') {
        const inc: Record<string, number> = { 'combat.damageDealt': damage };
        if (target.type === 'creature' && wasDowned) inc['combat.kills'] = 1;
        entries.push({ charsheetId: attacker.id, userId: attacker.odacId, charsheetName: attacker.name, inc });
    } else {
        // Dano causado por criatura ou pelo mestre diretamente
        entries.push({ gm: true, inc: { damageDealt: damage } });
    }

    return entries;
}

/** As estatísticas da campanha de uma cura (valor efetivo, respeitando o LP máximo) */
export function healStats(healer: Combatant | undefined, change: LpChange): StatsEntry[] {
    const { target, oldLp } = change;
    const effective = (target.currentLp ?? 0) - oldLp;
    if (effective <= 0) return [];

    const entries: StatsEntry[] = [];
    if (target.type === 'player') {
        entries.push({ charsheetId: target.id, userId: target.odacId, charsheetName: target.name, inc: { 'combat.healingReceived': effective } });
    }
    if (healer?.type === 'player') {
        entries.push({ charsheetId: healer.id, userId: healer.odacId, charsheetName: healer.name, inc: { 'combat.healingDone': effective } });
    } else {
        entries.push({ gm: true, inc: { healingDone: effective } });
    }
    return entries;
}
