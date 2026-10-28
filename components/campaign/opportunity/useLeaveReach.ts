'use client';

import { useCampaignContext } from '@contexts';
import { campaignService } from '@services';
import { asRequestError, errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface LeaveReach {
    busy: boolean;
    /** Declara a saída: devolve `true` se o servidor aceitou (os avisos de quem não pôde reagir saem em snackbar) */
    declare: (moverId: string, reactorIds: string[]) => Promise<boolean>;
    /** Desengajar: gasta a ação Padrão de quem saiu e não provoca nada. É aviso, não trava (o mestre decide) */
    disengage: (moverId: string) => Promise<boolean>;
    dismiss: (opportunityId: string) => Promise<void>;
}

/** Saída de alcance e ataque de oportunidade (ver `utils/combat/opportunities.ts`): chamadas ao servidor com os avisos na tela */
export function useLeaveReach(): LeaveReach {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const declare: LeaveReach['declare'] = async (moverId, reactorIds) => {
        setBusy(true);
        try {
            const result = await campaignService.declareLeave(campaign.id, { combatantId: moverId, reactorIds });
            (result.warnings ?? []).forEach(warning => { enqueueSnackbar(warning, { variant: 'warning' }); });
            enqueueSnackbar('Saída declarada. Quem pode reagir foi avisado.', { variant: 'info' });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao declarar a saída do alcance'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const disengage: LeaveReach['disengage'] = async (moverId) => {
        setBusy(true);
        try {
            await campaignService.spendCombatAction(campaign.id, { combatantId: moverId, execution: 'Padrão' });
            enqueueSnackbar('Desengajou: a ação Padrão foi gasta e a saída não provoca ataque de oportunidade.', { variant: 'success' });
            return true;
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE') {
                enqueueSnackbar('A ação Padrão já tinha sido usada nesta rodada. Avise o mestre: desengajar gasta uma Padrão.', { variant: 'warning' });
                return true;
            }
            enqueueSnackbar(errorMessage(error, 'Erro ao desengajar'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const dismiss: LeaveReach['dismiss'] = async (opportunityId) => {
        try {
            await campaignService.dismissOpportunity(campaign.id, opportunityId);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao dispensar a oportunidade'), { variant: 'error' });
        }
    };

    return { busy, declare, disengage, dismiss };
}
