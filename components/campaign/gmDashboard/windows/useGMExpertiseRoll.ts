import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import { Message, type AppliedEffect } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { effectDice, expertiseScope } from '@utils/combat/effectDice';
import { formatSheetRollText, planSheetRoll, rollSheetPlan, type SheetRollPlan } from '@utils/sheetRoll';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

type Sheet = Required<CharsheetDTO>;

export interface GMExpertiseRoll {
    /** Como seria a rolagem desta perícia (null: não dá para rolar agora, ex.: o sistema customizado ainda não chegou) */
    planFor: (expertise: string) => SheetRollPlan | null;
    /** Rola a perícia pelo jogador e manda o resultado ao chat da campanha, em nome do mestre */
    roll: (expertise: string) => Promise<void>;
}

/**
 * Rolagem de perícia do mestre em nome de um jogador: pela regra do botão da perícia na ficha (`utils/sheetRoll`),
 * com o bônus do personagem, e o resultado vai ao chat no formato `🎲 [Personagem] PERÍCIA - 2d20+3: [12, 7: 12] = 15`.
 * Manda uma mensagem pronta (não um texto), senão o chat tentaria rolar a notação de dados que está no texto.
 */
export function useGMExpertiseRoll(charsheet: Sheet, effects?: readonly AppliedEffect[]): GMExpertiseRoll {
    const { system } = useCharsheetSystem(charsheet.systemId);
    const { handleSendMessage, isChatOpen, setIsChatOpen } = useChatContext();
    const { data: session } = useSession();

    // Percepção e Furtividade levam as vantagens e desvantagens dos efeitos aplicados ao personagem no combate (`effectDice`)
    const dicePlan = useCallback((expertise: string) => {
        const scope = expertiseScope(expertise);
        return scope ? effectDice(effects, scope) : undefined;
    }, [ effects ]);

    const planFor = useCallback(
        (expertise: string) => planSheetRoll(charsheet, expertise, system, dicePlan(expertise)),
        [ charsheet, system, dicePlan ]
    );

    const roll = useCallback(async (expertise: string): Promise<void> => {
        const plan = planSheetRoll(charsheet, expertise, system, dicePlan(expertise));
        if (!plan || !session?.user) return;

        const result = rollSheetPlan(plan);
        const text = formatSheetRollText({ who: charsheet.name, label: expertise, plan, result });

        await handleSendMessage(new Message({
            text,
            type: MessageType.EXPERTISE,
            by: {
                id: session.user.id ?? '',
                name: session.user.name ?? '',
                image: session.user.image ?? ''
            },
            timestamp: new Date().toISOString(),
            isHTML: true
        }));

        if (!isChatOpen) setIsChatOpen(true);
    }, [ charsheet, system, dicePlan, session?.user, handleSendMessage, isChatOpen, setIsChatOpen ]);

    return { planFor, roll };
}
