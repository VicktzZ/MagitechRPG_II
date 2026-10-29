'use client';

import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Creature } from '@models';
import { buildCreatureDiceText, rollCreatureDice, type CreatureDice, type CreatureDiceRoll } from '@utils/combat/creatureDice';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

/**
 * O mestre rola um dado customizado de uma criatura: rola, soma os termos (bônus, atributo, perícia da criatura) e manda o cartão de dados ao chat da sessão em nome do mestre,
 * com o nome da criatura no cartão. `rollerName` é o nome que aparece no cartão (o do combatente, "Goblin (2)", quando é uma criatura em combate). `asPlayer` é para o jogador que controla um
 * invocado: a mensagem sai em nome dele (e não do mestre). Devolve a rolagem, para quem precisa do total (o ataque do invocado).
 */
export function useCreatureDiceRoll(): (creature: Creature, dice: CreatureDice, rollerName?: string, options?: { asPlayer?: boolean }) => Promise<CreatureDiceRoll> {
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { data: session } = useSession();

    return useCallback(async (creature, dice, rollerName, options) => {
        const roll = rollCreatureDice(dice, creature);
        const text = buildCreatureDiceText(rollerName || creature.name || 'Criatura', roll);

        // Mensagem pronta (e não texto cru): o chat tentaria rolar a notação que está no texto
        await handleSendMessage(new Message({
            text,
            type: MessageType.DICE,
            by: { id: session?.user?.id ?? '', name: session?.user?.name ?? '', image: session?.user?.image ?? '', isGM: !options?.asPlayer },
            timestamp: new Date().toISOString(),
            isHTML: true
        }));
        if (!isChatOpen) setIsChatOpen(true);
        return roll;
    }, [ handleSendMessage, isChatOpen, session, setIsChatOpen ]);
}
