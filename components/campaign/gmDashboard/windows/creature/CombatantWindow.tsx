'use client';

import { useCampaignContext } from '@contexts';
import { Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { campaignService } from '@services';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import type { CombatantVitalKey } from '@utils/combatantVitals';
import { errorMessage, asRequestError } from '@utils/errors';
import { getCreatureMpLimit, isCreatureMpLimitEnforced } from '@utils/mpLimit';
import { enqueueSnackbar } from 'notistack';
import { useSetMpSpent } from '../../actions/useSetMpSpent';
import { useCreatureExpertiseRoll } from '../../dashboard/useCreatureExpertiseRoll';
import { useGMWindowActions } from '../GMWindowProvider';
import { CombatantView } from './CombatantView';

/** Conteúdo da janela de uma criatura em combate: acompanha o combatente em tempo real e rola as perícias dela */
export default function CombatantWindow({ combatantId }: { combatantId: string }): ReactElement {
    const { campaign } = useCampaignContext();
    const { openWindow } = useGMWindowActions();
    const rollExpertise = useCreatureExpertiseRoll(null);
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaign.id);

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

    const mpLimit = creature && isCreatureMpLimitEnforced(creature, campaign.mode) ? getCreatureMpLimit(creature) : 0;

    // Conjurar gasta o MP da criatura e conta no limite da rodada; o servidor recusa (409) o que passar dele
    const castSpell = async (spell: { name: string; cost: number }): Promise<void> => {
        try {
            await campaignService.spendCombatMp(campaign.id, { combatantId: combatant.id, value: spell.cost });
            enqueueSnackbar(`${combatant.name} conjurou ${spell.name} (${spell.cost} MP)`, { variant: 'success' });
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'MP_LIMIT_EXCEEDED') {
                enqueueSnackbar(`${response.data.error ?? 'Limite de MP por turno excedido'} Libere ou resete o limite para conjurar.`, { variant: 'warning' });
            } else {
                console.error('Erro ao conjurar pela criatura:', error);
                enqueueSnackbar(errorMessage(error, 'Erro ao conjurar a magia da criatura'), { variant: 'error' });
            }
        }
    };

    const resetMpLimit = async (): Promise<void> => {
        try {
            await campaignService.resetMpLimit(campaign.id, { combatantId: combatant.id });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao resetar o limite de MP'), { variant: 'error' });
        }
    };

    return (
        <>
            <CombatantView
                combatant={combatant}
                creature={creature}
                inTurn={inTurn}
                onAdjustVital={(key, delta) => { void adjustVital(key, delta); }}
                onRollExpertise={async (name, expertise) => {
                    if (creature) await rollExpertise(name, expertise, creature, combatant);
                }}
                onOpenCreature={creature ? () => openWindow('creature', creature.id) : undefined}
                mpLimit={mpLimit}
                onCastSpell={spell => { void castSpell(spell); }}
                onResetMpLimit={() => { void resetMpLimit(); }}
                onSetMpSpent={() => {
                    openSetMpSpent({ id: combatant.id, name: combatant.name, spent: combatant.mpSpentThisTurn ?? 0, limit: mpLimit });
                }}
            />
            {setMpSpentDialog}
        </>
    );
}
