import { useCampaignContext } from '@contexts';
import type { Combatant, Creature } from '@models';
import { useMemo } from 'react';

/** Criatura da campanha que está em combate, com o combatente que a representa */
export interface CombatCreatureEntry {
    combatant: Combatant;
    creature: Creature;
    isCurrentTurn: boolean;
}

/** Criaturas customizadas que estão no combate: a que está em turno (para a rolagem padrão) e todas as ativas */
export function useCombatCreatures() {
    const { campaign } = useCampaignContext();

    // Obter criatura atualmente em turno (apenas para destaque)
    const currentCreatureInTurn = useMemo(() => {
        const combat = campaign.session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return null;
        }

        const current = combat.combatants[combat.currentTurnIndex];
        
        if (!current || current.type !== 'creature') return null;

        const rawId: string = current.id;
        let baseId: string = rawId;

        const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
        if (lastDashIndex > 0) {
            const possibleBaseId = rawId.slice(0, lastDashIndex);
            if (creatures.some(c => c.id === possibleBaseId)) {
                baseId = possibleBaseId;
            }
        }

        const baseCreature = creatures.find(c => c.id === baseId);
        if (!baseCreature) return null;

        return {
            combatant: current,
            creature: baseCreature
        };
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    // Obter TODAS as criaturas ativas no combate
    const allCreaturesInCombat = useMemo<CombatCreatureEntry[]>(() => {
        const combat = campaign.session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return [];
        }

        return combat.combatants
            .filter(combatant => combatant.type === 'creature')
            .map(combatant => {
                const rawId: string = combatant.id;
                let baseId: string = rawId;

                const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
                if (lastDashIndex > 0) {
                    const possibleBaseId = rawId.slice(0, lastDashIndex);
                    if (creatures.some(c => c.id === possibleBaseId)) {
                        baseId = possibleBaseId;
                    }
                }

                const baseCreature = creatures.find(c => c.id === baseId);
                if (!baseCreature) return null;

                return {
                    combatant,
                    creature: baseCreature,
                    isCurrentTurn: combat.combatants[combat.currentTurnIndex]?.id === combatant.id
                };
            })
            .filter((entry): entry is CombatCreatureEntry => entry !== null);
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    return { currentCreatureInTurn, allCreaturesInCombat };
}
