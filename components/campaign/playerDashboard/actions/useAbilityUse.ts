'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message } from '@models';
import { campaignService } from '@services';
import { buildAbilityHealText, type PassiveDef } from '@utils/combat/passives';
import { asRequestError } from '@utils/errors';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface AbilityUse {
    /** Chave da habilidade em uso (os quadrados ficam sem clique enquanto a rota responde) */
    busyKey: string | null;
    /** Usa a habilidade: o servidor confere os usos e o MP, gasta o MP e a ação e cura ou põe o efeito; a cura vai ao chat como cartão de dados */
    activateAbility: (ability: PassiveDef, choiceId?: string) => Promise<void>;
}

/**
 * Usar uma habilidade ativada de classe ou subclasse pelo quadrado da seção Ações. A linha do log ("Aria usou Cura Interior e curou 7 de LP") o servidor já manda ao chat; aqui
 * vai só o cartão de dados da cura rolada. Erro de regra (usos esgotados, sem MP, cura bloqueada) vira aviso; o mestre libera.
 */
export function useAbilityUse(): AbilityUse {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { data: session } = useSession();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busyKey, setBusyKey ] = useState<string | null>(null);

    const activateAbility: AbilityUse['activateAbility'] = async (ability, choiceId) => {
        if (!campaign?.id || !charsheet?.id || busyKey) return;

        try {
            setBusyKey(ability.key);
            const data = await campaignService.useAbility(campaign.id, { combatantId: charsheet.id, abilityKey: ability.key, ...(choiceId ? { choiceId } : {}) });
            for (const warning of data.warnings ?? []) enqueueSnackbar(warning, { variant: 'warning' });

            const heal = data.ability?.heal;
            if (heal && session?.user) {
                await handleSendMessage(new Message({
                    text: buildAbilityHealText(charsheet.name || session.user.name || 'Jogador', ability.name, heal),
                    type: MessageType.DICE,
                    by: { id: session.user.id ?? '', name: session.user.name ?? '', image: session.user.image ?? '' },
                    timestamp: new Date().toISOString(),
                    isHTML: true
                }));
                if (!isChatOpen) setIsChatOpen(true);
            }
        } catch (error) {
            const { response } = asRequestError(error);
            const code = response?.data?.code;
            if (response?.status === 409 && (code === 'ABILITY_BLOCKED' || code === 'HEALING_BLOCKED')) {
                enqueueSnackbar(String(response.data?.error ?? 'Não deu para usar a habilidade'), { variant: 'warning' });
            } else {
                console.error('Erro ao usar a habilidade:', error);
                enqueueSnackbar('Erro ao usar a habilidade', { variant: 'error' });
            }
        } finally {
            setBusyKey(null);
        }
    };

    return { busyKey, activateAbility };
}
