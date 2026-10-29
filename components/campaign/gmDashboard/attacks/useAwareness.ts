'use client';

import { useCampaignContext } from '@contexts';
import { campaignService } from '@services';
import type { HiddenCause } from '@utils/combat/awareness';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface Awareness {
    busy: boolean;
    /** Marca quem não vê o escondido; devolve `true` se o servidor aceitou (os avisos saem em snackbar) */
    hide: (hiderId: string, observerIds: string[], cause: HiddenCause) => Promise<boolean>;
    /** Revela o escondido a alguns observadores, ou a todos sem a lista */
    reveal: (hiderId: string, observerIds?: string[]) => Promise<boolean>;
}

/** Matriz de percepção (ver `utils/combat/awareness.ts`): chamadas ao servidor, que são só do mestre e não vão ao log nem ao chat, com os avisos na tela */
export function useAwareness(): Awareness {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const hide: Awareness['hide'] = async (hiderId, observerIds, cause) => {
        setBusy(true);
        try {
            const result = await campaignService.setUnseen(campaign.id, { combatantId: hiderId, observerIds, cause });
            (result.warnings ?? []).forEach(warning => { enqueueSnackbar(warning, { variant: 'warning' }); });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao marcar quem não vê o combatente'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const reveal: Awareness['reveal'] = async (hiderId, observerIds) => {
        setBusy(true);
        try {
            await campaignService.revealUnseen(campaign.id, { combatantId: hiderId, ...(observerIds ? { observerIds } : {}) });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao revelar o combatente'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    return { busy, hide, reveal };
}
