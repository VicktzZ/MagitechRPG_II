'use client';

import { useCampaignContext } from '@contexts';
import { Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { campaignService } from '@services';
import { actionBlocks, blockReason, isBlocked } from '@utils/combat/actionFlags';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import type { CombatantVitalKey } from '@utils/combatantVitals';
import { errorMessage, asRequestError } from '@utils/errors';
import { getCreatureMpLimit, isCreatureMpLimitEnforced } from '@utils/mpLimit';
import { enqueueSnackbar } from 'notistack';
import { useSetMpSpent } from '../../actions/useSetMpSpent';
import { useToggleCombatAction } from '../../actions/useToggleCombatAction';
import { useCreatureExpertiseRoll } from '../../dashboard/useCreatureExpertiseRoll';
import { useGMWindowActions } from '../GMWindowProvider';
import PlayerCombatantWindow from '../combatant/PlayerCombatantWindow';
import { CombatantView } from './CombatantView';

/**
 * Conteúdo da janela "Em combate": acompanha o combatente em tempo real. Criatura rola as perícias dela; jogador (o combatente leva o id da ficha) mostra a
 * ficha dele no combate (`PlayerCombatantWindow`).
 */
export default function CombatantWindow({ combatantId }: { combatantId: string }): ReactElement {
    const { campaign } = useCampaignContext();
    const { openWindow } = useGMWindowActions();
    const rollExpertise = useCreatureExpertiseRoll(null);
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaign.id);
    const { toggleAction } = useToggleCombatAction(campaign.id);

    const combat = campaign.session?.combat;
    const combatant = combat?.isActive ? combat.combatants?.find(candidate => candidate.id === combatantId) : undefined;

    if (!combatant) {
        return <Typography color="text.secondary">Este combatente não está mais no combate.</Typography>;
    }

    if (combatant.type === 'player') return <PlayerCombatantWindow combatantId={combatant.id} />;

    const creature = findBaseCreature(combatant.id, campaign.custom?.creatures ?? []) ?? null;
    const inTurn = combat?.combatants?.[combat.currentTurnIndex]?.id === combatant.id;

    // O servidor soma a variação ao valor de agora; a barra muda sozinha quando o combate chega do Firestore
    const adjustVital = async (key: CombatantVitalKey, delta: number): Promise<void> => {
        // Necrose, Incurável...: a cura é bloqueada. O ajuste rápido é do mestre, então só avisa e aplica
        const blocks = actionBlocks(combatant.effects);
        if (key === 'lp' && delta > 0 && isBlocked(blocks, 'no_healing')) {
            enqueueSnackbar(`${blockReason(blocks, 'no_healing', combatant.name)}.`, { variant: 'warning' });
        }
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
        // Silenciamento, Paralisia... (flag `no_spells`): a criatura não conjura. O mestre libera tirando o efeito
        const castBlocks = actionBlocks(combatant.effects);
        if (isBlocked(castBlocks, 'no_spells')) {
            enqueueSnackbar(`${blockReason(castBlocks, 'no_spells', combatant.name)}.`, { variant: 'warning' });
            return;
        }
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
                onToggleAction={(slot, available) => { void toggleAction(combatant.id, slot, available); }}
                onSetMpSpent={() => {
                    openSetMpSpent({ id: combatant.id, name: combatant.name, spent: combatant.mpSpentThisTurn ?? 0, limit: mpLimit });
                }}
            />
            {setMpSpentDialog}
        </>
    );
}
