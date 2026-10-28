'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message } from '@models';
import { campaignService } from '@services';
import { buildDefenseRollMessage } from '@utils/combat/defenseRoller';
import { combatantEffects, effectDice } from '@utils/combat/effectDice';
import type { DefenseChoice } from '@utils/combat/engine/defense';
import { defenseSkillFor, type PendingAttackData } from '@utils/combat/pendingAttacks';
import { asRequestError, errorMessage } from '@utils/errors';
import { planSheetRoll, rollSheetPlan } from '@utils/sheetRoll';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface DefenseDeclaration {
    /** Id do ataque que está sendo respondido agora (desabilita os botões dele) */
    busyId: string | null;
    /** Rola a defesa pela ficha (regra do botão da perícia), declara ao mestre e manda o resultado ao chat (cartão com a DT e Sucesso/Falhou). `none` só declara que não vai se defender */
    defend: (attack: PendingAttackData, choice: DefenseChoice) => Promise<void>;
}

/**
 * Defesa do jogador atacado: ele escolhe esquivar (Reflexos), resistir (a RES da natureza do ataque) ou não se defender. A rolagem sai da ficha pela regra do
 * botão da perícia (`planSheetRoll`, a mesma que o mestre usa quando rola pelo jogador), vai ao servidor (`declare_defense`, uma vez só) e depois ao chat,
 * num cartão de defesa com a DT (resistência: metade do total do ataque; esquiva: total + 1) e se passou (`buildDefenseRollMessage`).
 * O mestre parte desse teste ao resolver, mas pode trocar tudo.
 */
export function useDefenseDeclaration(): DefenseDeclaration {
    const { campaign, rpgSystem } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { data: session } = useSession();
    const { handleSendMessage, isChatOpen, setIsChatOpen } = useChatContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busyId, setBusyId ] = useState<string | null>(null);

    const defend: DefenseDeclaration['defend'] = async (attack, choice) => {
        if (busyId || !campaign?.id) return;

        const skill = choice === 'none' ? '' : defenseSkillFor(attack, choice);
        // Esquivar leva as vantagens e desvantagens de esquiva dos efeitos (Atordoamento, Evasão...); resistir não tem alvo próprio no catálogo
        const effects = choice === 'dodge' ? effectDice(combatantEffects(campaign.session?.combat, charsheet?.id), 'dodge') : undefined;
        const plan = choice === 'none' ? null : planSheetRoll(charsheet, skill, rpgSystem, effects);
        if (choice !== 'none' && !plan) {
            enqueueSnackbar(`Não deu para rolar ${skill} pela ficha. Peça ao mestre para rolar por você.`, { variant: 'warning' });
            return;
        }

        const result = plan ? rollSheetPlan(plan) : null;
        setBusyId(attack.id);
        try {
            await campaignService.declareDefense(campaign.id, {
                attackId: attack.id,
                defense: choice === 'none' || !plan || !result
                    ? { choice: 'none' }
                    : { choice, skill, total: result.total, rolls: result.rolls, used: result.used, bonus: plan.bonus }
            });
        } catch (error) {
            const { response } = asRequestError(error);
            const already = response?.status === 409 && response.data?.code === 'DEFENSE_ALREADY_DECLARED';
            enqueueSnackbar(errorMessage(error, 'Não consegui enviar a defesa ao mestre'), { variant: already ? 'info' : 'error' });
            setBusyId(null);
            return;
        }

        // A defesa já está com o mestre; o chat é um extra e uma falha dele não desfaz nada
        if (plan && result && session?.user && choice !== 'none') {
            try {
                await handleSendMessage(new Message({
                    text: buildDefenseRollMessage({ who: charsheet.name, skill, choice, attack, plan, result }),
                    type: MessageType.DICE,
                    by: { id: session.user.id ?? '', name: session.user.name ?? '', image: session.user.image ?? '' },
                    timestamp: new Date().toISOString(),
                    isHTML: true
                }));
                if (!isChatOpen) setIsChatOpen(true);
            } catch (error) {
                console.error('Erro ao mandar a rolagem de defesa ao chat:', error);
            }
        }
        setBusyId(null);
    };

    return { busyId, defend };
}
