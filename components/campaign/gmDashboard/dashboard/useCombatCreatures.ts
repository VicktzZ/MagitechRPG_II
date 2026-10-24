import { useCampaignContext } from '@contexts';
import type { Combatant, Creature } from '@models';
import { useMemo } from 'react';
import { creatureCombatants, findBaseCreature } from './combatCreatureLookup';

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

        const baseCreature = findBaseCreature(current.id, creatures);
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

        if (!combat?.isActive) return [];

        return creatureCombatants(combat.combatants)
            .map(combatant => {
                const baseCreature = findBaseCreature(combatant.id, creatures);
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
