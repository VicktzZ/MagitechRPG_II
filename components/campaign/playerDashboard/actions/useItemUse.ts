'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Item } from '@models';
import { campaignService } from '@services';
import type { TileExecution } from '@utils/combat/actionTiles';
import { asRequestError } from '@utils/errors';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';

export interface ItemUse {
    /** Usa o item em combate: avisa no chat e gasta a ação dele. Aviso, nunca trava: o mestre decide quando a ação já tinha acabado */
    activateItem: (item: Pick<Item, 'name'>, execution: TileExecution, targetName?: string) => Promise<void>;
}

/**
 * Usar um item pelos quadrados da seção Ações. O app ainda não tem a mecânica do item (consumir, aplicar o efeito): o uso é avisado no chat, com o alvo quando é ataque,
 * e a ação é gasta. **Premissa minha, a rever**: o item não é consumido e o efeito é do mestre.
 */
export function useItemUse(): ItemUse {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { data: session } = useSession();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { enqueueSnackbar } = useSnackbar();

    const activateItem: ItemUse['activateItem'] = async (item, execution, targetName) => {
        if (!campaign?.id || !charsheet?.id) return;
        const playerName = charsheet.name || session?.user?.name || 'Jogador';

        if (session?.user) {
            await handleSendMessage(new Message({
                text: `${playerName} usou **${item.name}**${targetName ? ` contra **${targetName}**` : ''}.`,
                type: MessageType.COMBAT_LOG,
                by: { id: session.user.id ?? '', name: session.user.name ?? '', image: session.user.image ?? '' },
                timestamp: new Date().toISOString(),
                isHTML: true
            }));
            if (!isChatOpen) setIsChatOpen(true);
        }

        try {
            await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution });
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE') {
                enqueueSnackbar(`Você já não tinha a ação ${execution} disponível nesta rodada. Avise o mestre.`, { variant: 'warning' });
            } else {
                console.error('Erro ao gastar a ação do item:', error);
                enqueueSnackbar(`Não consegui gastar a ação ${execution}. Avise o mestre.`, { variant: 'warning' });
            }
        }
    };

    return { activateItem };
}
