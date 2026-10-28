'use client';

import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

interface ToggleCombatAction {
    /** Clique do mestre num marcador de ação: disponível vira gasta, gasta volta a ficar disponível */
    toggleAction: (combatantId: string, slot: ActionSlot, available: boolean) => Promise<void>;
    /** Esperando o servidor */
    busy: boolean;
}

/** O mestre gasta ou devolve uma ação da rodada de qualquer combatente (`set_actions`: só o espaço clicado muda; fica no log do combate) */
export function useToggleCombatAction(campaignId: string): ToggleCombatAction {
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const toggleAction = useCallback(async (combatantId: string, slot: ActionSlot, available: boolean): Promise<void> => {
        setBusy(true);
        try {
            await campaignService.setCombatActions(campaignId, { combatantId, actions: { [slot]: available ? 0 : 1 } });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao ajustar as ações'), { variant: 'error' });
        } finally {
            setBusy(false);
        }
    }, [ campaignId, enqueueSnackbar ]);

    return { toggleAction, busy };
}
