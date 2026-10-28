import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Weapon } from '@models';
import { campaignService } from '@services';
import { asRequestError } from '@utils/errors';
import {
    rollWeaponHit,
    rollWeaponDamage,
    buildHitMessageText,
    buildDamageMessageText,
    buildDamageErrorText
} from '@utils/combat/weaponRoller';
import { isCombatantStealthy } from '@utils/combat/stealth';
import { isOpportunityWeapon, OPPORTUNITY_WEAPON_HELP } from '@utils/combat/opportunities';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useAttackTargeting } from '../attacks/useAttackTargeting';

/**
 * Rolagens de acerto e dano das armas do inventário, enviadas ao chat da sessão: o acerto como log de combate e o dano
 * como mensagem de dados (cartão com o total à vista e as rolagens no dropdown, ver `actionRollMessage.ts`).
 * Com o efeito Furtivo (em combate ativo) o acerto rola 1d20 a mais (vantagem) e o dano sai dobrado, e o chat diz isso (`stealth.ts`).
 */
export function useWeaponRolls() {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    // Ataque assistido: em combate, na fase de ação, o acerto e o dano da arma vão ao mestre (alvo escolhido no inventário)
    const { targeting, declare, attachDamage } = useAttackTargeting();

    const sendCombatChatMessage = async (text: string, type: MessageType = MessageType.COMBAT_LOG) => {
        if (!session?.user) return;
        await handleSendMessage(new Message({
            text,
            type,
            by: {
                id: session.user.id ?? '',
                name: session.user.name ?? '',
                image: session.user.image ?? ''
            },
            timestamp: new Date().toISOString(),
            isHTML: true
        }));
        if (!isChatOpen) setIsChatOpen(true);
    };

    const handleWeaponHit = async (weapon: Weapon, e: ReactMouseEvent) => {
        e.stopPropagation();
        // Ataque de oportunidade (um inimigo saiu do alcance dele): só arma branca, e a ação gasta é a Reação. Antes de rolar, para não deixar rolagem solta no chat
        const opportunity = targeting.opportunity.active;
        if (opportunity && !isOpportunityWeapon(weapon)) {
            enqueueSnackbar(OPPORTUNITY_WEAPON_HELP, { variant: 'warning' });
            return;
        }
        const hit = rollWeaponHit(weapon, charsheet, { stealth: isCombatantStealthy(campaign?.session?.combat, charsheet?.id) });
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        await sendCombatChatMessage(buildHitMessageText(playerName, weapon, hit));

        // Refazer o acerto da mesma arma troca o ataque que ainda espera o dano e não gasta outra ação
        const { declared, isNew } = await declare({
            source: 'weapon',
            name: weapon.name,
            kind: 'fisico',
            attackType: weapon.effect?.effectType ?? undefined,
            attackTotal: hit.total,
            rolls: hit.rolls,
            bonus: hit.bonus
        }, { opportunity });
        if (!declared || !isNew || !campaign?.id || !charsheet?.id) return;

        // Atacar gasta a ação Padrão (a Reação, no ataque de oportunidade): é aviso, nunca trava (o mestre decide)
        const execution = opportunity ? 'Reação' : 'Padrão';
        try {
            await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution });
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE') {
                enqueueSnackbar(`Você já não tinha a ação ${execution} disponível nesta rodada. Avise o mestre.`, { variant: 'warning' });
            } else {
                console.error('Erro ao gastar a ação do ataque:', error);
            }
        }
    };

    const handleWeaponDamage = async (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => {
        e.stopPropagation();
        const result = rollWeaponDamage(weapon, isCritical, { stealth: isCombatantStealthy(campaign?.session?.combat, charsheet?.id) });
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        if (!result) {
            await sendCombatChatMessage(buildDamageErrorText(weapon, isCritical));
            return;
        }
        await sendCombatChatMessage(buildDamageMessageText(playerName, weapon, result), MessageType.DICE);

        // O dano se junta ao ataque que esperava por ele (o que o jogador declarou no acerto)
        await attachDamage(weapon.name, 'weapon', result.total, isCritical);
    };

    return { handleWeaponHit, handleWeaponDamage, targeting };
}
