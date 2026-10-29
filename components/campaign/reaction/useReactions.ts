'use client';

import { useCampaignContext } from '@contexts';
import { campaignService } from '@services';
import type { ReactionTrigger } from '@utils/combat/reactions';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface Reactions {
    busy: boolean;
    /** Abre a reação (só o mestre): devolve `true` se o servidor aceitou; os avisos de quem não pôde reagir saem em snackbar */
    open: (input: { trigger: ReactionTrigger; subjectId?: string; text?: string; reactorIds: string[] }) => Promise<boolean>;
    dismiss: (reactionId: string) => Promise<void>;
}

/** Reações abertas (ver `utils/combat/reactions.ts`): chamadas ao servidor com os avisos na tela */
export function useReactions(): Reactions {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const open: Reactions['open'] = async (input) => {
        setBusy(true);
        try {
            const result = await campaignService.openReaction(campaign.id, input);
            (result.warnings ?? []).forEach(warning => { enqueueSnackbar(warning, { variant: 'warning' }); });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao abrir a reação'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const dismiss: Reactions['dismiss'] = async (reactionId) => {
        try {
            await campaignService.dismissReaction(campaign.id, reactionId);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao dispensar a reação'), { variant: 'error' });
        }
    };

    return { busy, open, dismiss };
}
