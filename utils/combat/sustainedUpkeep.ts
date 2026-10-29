import { CombatLog, type Combat } from '@models';
import { charsheetRepository } from '@repositories';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';
import { endSustained, buildSustainedEffect, startSustained } from './sustainedEffect';
import { planSustainedUpkeep, sustainedEffects, type UpkeepEnding } from './sustainedSpells';

export { buildSustainedEffect, endSustained, startSustained };

const endingText = (reason: UpkeepEnding['reason']): string =>
    reason === 'sem-mana' ? 'não tinha MP para manter' : 'ficou sem MP';

/**
 * A rodada virou: cada jogador paga a manutenção das magias sustentadas que mantém. O MP sai da ficha (a conta do MP é a da ficha) e conta no
 * limite de MP por turno da rodada nova (o limite acabou de zerar); a que não couber no MP, ou que deixar o MP em 0, acaba. Chame depois de
 * zerar o limite (`resetMpLimitWindows`).
 */
export async function applySustainedUpkeep(combat: Combat): Promise<void> {
    for (const combatant of combat.combatants) {
        if (combatant.type !== 'player') continue;
        const sustained = sustainedEffects(combatant.effects);
        if (sustained.length === 0) continue;

        const sheet = await charsheetRepository.findById(combatant.id);
        const mp = Number(sheet?.stats?.mp ?? combatant.currentMp ?? 0);
        const plan = planSustainedUpkeep(
            sustained.flatMap(effect => (effect.sustained ? [ { id: effect.id, info: effect.sustained } ] : [])),
            mp
        );

        if (plan.totalPaid > 0) {
            await adjustCharsheetStats(combatant.id, { mp: -plan.totalPaid });
            combatant.mpSpentThisTurn = (combatant.mpSpentThisTurn ?? 0) + plan.totalPaid;
            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'effect_tick',
                actorId: combatant.id,
                actorName: combatant.name,
                targetId: combatant.id,
                targetName: combatant.name,
                value: plan.totalPaid,
                message: `**${combatant.name}** pagou ${plan.totalPaid} MP para manter ${plan.payments.map(payment => `**${payment.spellName}**`).join(', ')}.`
            }));
        }
        combatant.currentMp = plan.mpAfter;

        if (plan.endings.length > 0) {
            const ids = new Set(plan.endings.map(ending => ending.effectId));
            combatant.effects = combatant.effects.filter(effect => !ids.has(effect.id));
            for (const ending of plan.endings) {
                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'effect_expired',
                    actorId: combatant.id,
                    actorName: combatant.name,
                    targetId: combatant.id,
                    targetName: combatant.name,
                    message: `**${ending.spellName}** acabou: **${combatant.name}** ${endingText(ending.reason)}.`
                }));
            }
        }
    }
}
