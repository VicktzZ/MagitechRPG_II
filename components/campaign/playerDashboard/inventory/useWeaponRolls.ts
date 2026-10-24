import { useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Weapon } from '@models';
import {
    rollWeaponHit,
    rollWeaponDamage,
    buildHitMessageText,
    buildDamageMessageText,
    buildDamageErrorText
} from '@utils/combat/weaponRoller';
import { useSession } from 'next-auth/react';
import type { MouseEvent as ReactMouseEvent } from 'react';

/**
 * Rolagens de acerto e dano das armas do inventário, enviadas ao chat da sessão: o acerto como log de combate e o dano
 * como mensagem de dados (cartão com o total à vista e as rolagens no dropdown, ver `actionRollMessage.ts`)
 */
export function useWeaponRolls() {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { data: session } = useSession();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();

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
        const hit = rollWeaponHit(weapon, charsheet);
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        await sendCombatChatMessage(buildHitMessageText(playerName, weapon, hit));
    };

    const handleWeaponDamage = async (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => {
        e.stopPropagation();
        const result = rollWeaponDamage(weapon, isCritical);
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        if (!result) {
            await sendCombatChatMessage(buildDamageErrorText(weapon, isCritical));
            return;
        }
        await sendCombatChatMessage(buildDamageMessageText(playerName, weapon, result), MessageType.DICE);
    };

    return { handleWeaponHit, handleWeaponDamage };
}
