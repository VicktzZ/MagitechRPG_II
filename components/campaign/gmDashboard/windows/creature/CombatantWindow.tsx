'use client';

import { useCampaignContext } from '@contexts';
import { Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { campaignService } from '@services';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import type { CombatantVitalKey } from '@utils/combatantVitals';
import { errorMessage } from '@utils/errors';
import { enqueueSnackbar } from 'notistack';
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

    // O servidor soma a variação ao valor de agora; a barra muda sozinha quando o combate chega do Firestore
    const adjustVital = async (key: CombatantVitalKey, delta: number): Promise<void> => {
        try {
            await campaignService.adjustCombatantVitals(campaign.id, combatant.id, { [key]: delta });
        } catch (error) {
            console.error('Erro ao ajustar a criatura em combate:', error);
            enqueueSnackbar(`Erro ao ajustar pontos vitais: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }
    };

    return (
        <CombatantView
            combatant={combatant}
            creature={creature}
            inTurn={inTurn}
            onAdjustVital={(key, delta) => { void adjustVital(key, delta); }}
            onRollExpertise={async (name, expertise) => {
                if (creature) await rollExpertise(name, expertise, creature, combatant);
            }}
            onOpenCreature={creature ? () => openWindow('creature', creature.id) : undefined}
        />
    );
}
