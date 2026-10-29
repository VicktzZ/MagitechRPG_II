import { AppliedEffect, CombatEffect, CombatEffectLevel, CombatLog, type Combat, type SustainedSpellInfo } from '@models';
import { color } from '@themes/tokens';
import { v4 as uuidv4 } from 'uuid';
import { sustainedEffects } from './sustainedSpells';

/**
 * A magia sustentada como efeito sobre o conjurador: construir, pôr e tirar. Fica à parte de `sustainedUpkeep.ts` (que lê a ficha pelo repositório para cobrar a manutenção)
 * para quem só precisa encerrar as magias, como o gasto de todo o MP de uma habilidade, não carregar o repositório.
 */

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
