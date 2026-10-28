'use client';

import { useCampaignContext } from '@contexts';
import { campaignService, charsheetService } from '@services';
import { getSheetMetrics } from '@utils/charsheetMetrics';
import { actionBlocks, blockReason, isBlocked } from '@utils/combat/actionFlags';
import { combatantEffects } from '@utils/combat/effectDice';
import { errorMessage } from '@utils/errors';
import type { VitalKey } from '@utils/vitals';
import { enqueueSnackbar } from 'notistack';
import type { ReactElement } from 'react';
import { useQuickEffect } from '../../actions/useQuickEffect';
import { useSetMpSpent } from '../../actions/useSetMpSpent';
import { useToggleCombatAction } from '../../actions/useToggleCombatAction';
import { useGMWindowActions } from '../GMWindowProvider';
import { SheetWindow } from '../SectionWindows';
import type { SummarySheet } from '../SummaryView';
import { useGMExpertiseRoll } from '../useGMExpertiseRoll';
import { PlayerCombatantView } from './PlayerCombatantView';

/** Corpo da janela: acompanha a ficha e o combatente do jogador em tempo real e leva os diálogos de efeito e de MP gasto */
function PlayerCombatantBody({ charsheet, combatantId }: { charsheet: SummarySheet; combatantId: string }): ReactElement {
    const { campaign, users } = useCampaignContext();
    const { openWindow } = useGMWindowActions();
    const { openEffectFor, effectDialog } = useQuickEffect(campaign.id);
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaign.id);
    const { toggleAction } = useToggleCombatAction(campaign.id);
    // Os efeitos do personagem no combate mexem nos d20 de Percepção e Furtividade
    const { planFor, roll } = useGMExpertiseRoll(charsheet, combatantEffects(campaign.session?.combat, charsheet.id));

    const combat = campaign.session?.combat;
    const combatant = combat?.combatants?.find(candidate => candidate.id === combatantId);
    if (!combat?.isActive || !combatant) {
        return <p>Este jogador não está mais no combate.</p>;
    }

    const inTurn = combat.combatants?.[combat.currentTurnIndex]?.id === combatant.id;
    const metrics = getSheetMetrics(charsheet, campaign.mode, combat);

    // O servidor soma a variação ao valor de agora; a barra muda sozinha quando a ficha chega do Firestore
    const adjustVital = async (key: VitalKey, delta: number): Promise<void> => {
        // Necrose, Incurável...: a cura é bloqueada. O ajuste rápido é do mestre, então só avisa e aplica
        const blocks = actionBlocks(combatant.effects);
        if (key === 'lp' && delta > 0 && isBlocked(blocks, 'no_healing')) {
            enqueueSnackbar(`${blockReason(blocks, 'no_healing', combatant.name || charsheet.name)}.`, { variant: 'warning' });
        }
        try {
            await charsheetService.adjustStats(charsheet.id, { [key]: delta });
        } catch (error) {
            console.error('Erro ao ajustar pontos vitais:', error);
            enqueueSnackbar(`Erro ao ajustar pontos vitais: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }
    };

    const resetMpLimit = async (): Promise<void> => {
        try {
            await campaignService.resetMpLimit(campaign.id, { combatantId: combatant.id });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao resetar o limite de MP'), { variant: 'error' });
        }
    };

    const rollExpertise = (name: string): void => {
        if (!planFor(name)) {
            enqueueSnackbar(`Não deu para rolar ${name} pela ficha agora.`, { variant: 'warning' });
            return;
        }
        roll(name).catch((error: unknown) => {
            enqueueSnackbar(errorMessage(error, 'Erro ao rolar a perícia'), { variant: 'error' });
        });
    };

    return (
        <>
            <PlayerCombatantView
                charsheet={charsheet}
                combatant={combatant}
                inTurn={inTurn}
                imageUrl={users.players?.find(user => user.id === charsheet.userId)?.image ?? undefined}
                metrics={metrics}
                onAdjustVital={(key, delta) => { void adjustVital(key, delta); }}
                onToggleAction={(slot, available) => { void toggleAction(combatant.id, slot, available); }}
                onSetMpSpent={() => {
                    openSetMpSpent({ id: combatant.id, name: combatant.name || charsheet.name, spent: metrics.mpSpent ?? combatant.mpSpentThisTurn ?? 0, limit: metrics.mpLimit ?? 0 });
                }}
                onResetMpLimit={() => { void resetMpLimit(); }}
                onApplyEffect={() => { openEffectFor({ id: combatant.id, name: combatant.name || charsheet.name }); }}
                onOpenSection={kind => openWindow(kind, charsheet.id)}
                onRollExpertise={rollExpertise}
            />
            {effectDialog}
            {setMpSpentDialog}
        </>
    );
}

/** Conteúdo da janela "Em combate" de um jogador: o combatente do jogador leva o id da ficha */
export default function PlayerCombatantWindow({ combatantId }: { combatantId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={combatantId}>
            {charsheet => <PlayerCombatantBody charsheet={charsheet} combatantId={combatantId} />}
        </SheetWindow>
    );
}
