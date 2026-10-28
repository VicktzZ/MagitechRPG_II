import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Combatant, type Weapon } from '@models';
import { campaignService } from '@services';
import { asRequestError, errorMessage } from '@utils/errors';
import { findAwaitingDamage, type PendingAttackData } from '@utils/combat/pendingAttacks';
import {
    rollWeaponHit,
    rollWeaponDamage,
    buildHitMessageText,
    buildDamageMessageText,
    buildDamageErrorText
} from '@utils/combat/weaponRoller';
import { isCombatantStealthy } from '@utils/combat/stealth';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useState, type MouseEvent as ReactMouseEvent } from 'react';

/** O ataque assistido do jogador: em combate ativo ele escolhe o alvo e o acerto e o dano da arma vão para o mestre confirmar */
export interface AttackTargeting {
    /** O jogador está no combate, na fase de ação: dá para atacar com alvo */
    enabled: boolean;
    targets: Combatant[];
    targetId: string;
    setTargetId: (id: string) => void;
    /** Ataques dele que o mestre ainda não resolveu */
    pending: PendingAttackData[];
}

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
    const [ selectedTarget, setTargetId ] = useState('');

    // Ataque assistido: só em combate ativo, na fase de ação, para quem está nele
    const combat = campaign?.session?.combat;
    const inAction = Boolean(combat?.isActive && combat.phase === 'ACTION' && combat.combatants?.some(c => c.id === charsheet?.id));
    const targets = inAction ? (combat?.combatants ?? []).filter(c => c.id !== charsheet?.id) : [];
    const targetId = targets.some(c => c.id === selectedTarget) ? selectedTarget : '';
    const pending = (combat?.pendingAttacks ?? []).filter(entry => entry.attackerId === charsheet?.id);

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
        const hit = rollWeaponHit(weapon, charsheet, { stealth: isCombatantStealthy(campaign?.session?.combat, charsheet?.id) });
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        await sendCombatChatMessage(buildHitMessageText(playerName, weapon, hit));

        if (!inAction || !targetId || !campaign?.id || !charsheet?.id) return;
        // Refazer o acerto da mesma arma troca o ataque que ainda espera o dano e não gasta outra ação
        const isNewAttack = !findAwaitingDamage(combat?.pendingAttacks, charsheet.id, weapon.name);
        try {
            await campaignService.declareAttack(campaign.id, {
                combatantId: charsheet.id,
                targetId,
                attack: {
                    source: 'weapon',
                    name: weapon.name,
                    kind: 'fisico',
                    attackType: weapon.effect?.effectType ?? undefined,
                    attackTotal: hit.total,
                    rolls: hit.rolls,
                    bonus: hit.bonus
                }
            });
            enqueueSnackbar('Ataque declarado. Role o dano; o mestre confirma o resultado.', { variant: 'info' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Não consegui declarar o ataque ao mestre'), { variant: 'error' });
            return;
        }

        // Atacar gasta a ação Padrão: é aviso, nunca trava (o mestre decide)
        if (!isNewAttack) return;
        try {
            await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution: 'Padrão' });
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE') {
                enqueueSnackbar('Você já não tinha a ação Padrão disponível nesta rodada. Avise o mestre.', { variant: 'warning' });
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
        const awaiting = inAction && charsheet?.id ? findAwaitingDamage(combat?.pendingAttacks, charsheet.id, weapon.name) : undefined;
        if (!awaiting || !campaign?.id) return;
        try {
            await campaignService.setAttackDamage(campaign.id, { attackId: awaiting.id, damage: result.total, critical: isCritical });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Não consegui enviar o dano ao mestre'), { variant: 'error' });
        }
    };

    const targeting: AttackTargeting = { enabled: inAction, targets, targetId, setTargetId, pending };

    return { handleWeaponHit, handleWeaponDamage, targeting };
}
