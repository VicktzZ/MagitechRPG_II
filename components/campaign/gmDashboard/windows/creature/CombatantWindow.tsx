'use client';

import { useCampaignContext } from '@contexts';
import { Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { findBaseCreature } from '../../dashboard/combatCreatureLookup';
import { useCreatureExpertiseRoll } from '../../dashboard/useCreatureExpertiseRoll';
import { useGMWindowActions } from '../GMWindowProvider';
import { CombatantView } from './CombatantView';

/** Conteúdo da janela de uma criatura em combate: acompanha o combatente em tempo real e rola as perícias dela */
export default function CombatantWindow({ combatantId }: { combatantId: string }): ReactElement {
    const { campaign } = useCampaignContext();
    const { openWindow } = useGMWindowActions();
    const rollExpertise = useCreatureExpertiseRoll(null);

    const combat = campaign.session?.combat;
    const combatant = combat?.isActive ? combat.combatants?.find(candidate => candidate.id === combatantId) : undefined;

    if (!combatant) {
        return <Typography color="text.secondary">Esta criatura não está mais no combate.</Typography>;
    }

    const creature = findBaseCreature(combatant.id, campaign.custom?.creatures ?? []) ?? null;
    const inTurn = combat?.combatants?.[combat.currentTurnIndex]?.id === combatant.id;

    return (
        <CombatantView
            combatant={combatant}
            creature={creature}
            inTurn={inTurn}
            onRollExpertise={async (name, expertise) => {
                if (creature) await rollExpertise(name, expertise, creature, combatant);
            }}
            onOpenCreature={creature ? () => openWindow('creature', creature.id) : undefined}
        />
    );
}
