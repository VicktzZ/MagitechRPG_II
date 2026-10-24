import { AppliedEffect, CombatEffect, CombatEffectLevel, CombatLog, type Combat, type SustainedSpellInfo } from '@models';
import { charsheetRepository } from '@repositories';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';
import { color } from '@themes/tokens';
import { v4 as uuidv4 } from 'uuid';
import { planSustainedUpkeep, sustainedEffects, type UpkeepEnding } from './sustainedSpells';

/** O efeito que marca a magia sustentada sobre o conjurador: nome da magia, indefinido, sem tick (só sai ao desconjurar ou faltar MP) */
export function buildSustainedEffect(info: SustainedSpellInfo, round: number, appliedByName: string, appliedById: string): AppliedEffect {
    const snapshot = new CombatEffect({
        id: `sustained:${info.spellKey}`,
        name: info.spellName,
        description: `Magia sustentada (estágio ${info.stage}): paga ${info.upkeep} MP a cada rodada para manter. Acaba ao desconjurar, ao faltar MP ou ao fim do combate.`,
        category: 'buff',
        timing: 'round',
        color: color.mp,
        icon: '',
        usesLevels: false,
        levels: [ new CombatEffectLevel({ level: 1, formula: '0', duration: 0, indefinite: true }) ]
    });

    return new AppliedEffect({
        id: uuidv4(),
        effectId: snapshot.id,
        snapshot: JSON.parse(JSON.stringify(snapshot)) as CombatEffect,
        level: 1,
        remaining: 0,
        indefinite: true,
        appliedAtRound: round,
        appliedByName,
        appliedById,
        sustained: info
    });
}

/** Põe a magia sustentada sobre o combatente; conjurar de novo a mesma magia troca o efeito antigo */
export function startSustained(combat: Combat, combatantId: string, info: SustainedSpellInfo): { name: string } | null {
    const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId);
    if (!combatant || combatant.type !== 'player') return null;

    combatant.effects = (combatant.effects ?? []).filter(effect => effect.sustained?.spellKey !== info.spellKey);
    combatant.effects.push(buildSustainedEffect(info, combat.round, combatant.name, combatant.id));
    combat.logs.push(new CombatLog({
        round: combat.round,
        type: 'effect_applied',
        actorId: combatant.id,
        actorName: combatant.name,
        targetId: combatant.id,
        targetName: combatant.name,
        message: `**${combatant.name}** mantém **${info.spellName}** (estágio ${info.stage}): paga ${info.upkeep} MP a cada rodada.`
    }));
    return { name: combatant.name };
}

const endingText = (reason: UpkeepEnding['reason']): string =>
    reason === 'sem-mana' ? 'não tinha MP para manter' : 'ficou sem MP';

/** Encerra uma (ou todas, sem `spellKey`) das magias sustentadas do combatente, de propósito (desconjurar) */
export function endSustained(combat: Combat, combatantId: string, spellKey?: string): number {
    const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId);
    if (!combatant) return 0;

    const ending = sustainedEffects(combatant.effects).filter(effect => !spellKey || effect.sustained?.spellKey === spellKey);
    if (ending.length === 0) return 0;

    const ids = new Set(ending.map(effect => effect.id));
    combatant.effects = combatant.effects.filter(effect => !ids.has(effect.id));
    for (const effect of ending) {
        combat.logs.push(new CombatLog({
            round: combat.round,
            type: 'effect_expired',
            actorId: combatant.id,
            actorName: combatant.name,
            targetId: combatant.id,
            targetName: combatant.name,
            message: `**${combatant.name}** desconjurou **${effect.sustained?.spellName ?? effect.snapshot?.name ?? 'a magia'}**.`
        }));
    }
    return ending.length;
}

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
