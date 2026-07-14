import type { FirestoreOnChange } from '@models/types/firestoreRealtime';
import type { CampaignData } from '@models/types/session';
import type { Message } from '@models';
import { useMemo } from 'react';
import { useFirestoreRealtime } from './useFirestoreRealtime';
import { useStableArrayItems, useStableValue } from './useStableValue';

interface UseCampaignDataOptions {
    campaignCode: string;
    userId?: string;
    onChange?: FirestoreOnChange
}

interface UseCampaignDataResult {
    data: CampaignData | null;
    /**
     * Mensagens do chat, separadas de `data`: elas mudam a cada mensagem de
     * qualquer jogador e manterí-las dentro de `data.campaign` invalidava a
     * identidade da campanha inteira (e todos os consumidores do contexto)
     * a cada mensagem. `data.campaign.session.messages` vem sempre vazio.
     */
    messages: Message[];
}

const EMPTY_MESSAGES: Message[] = [];

export function useCampaignData({
    campaignCode,
    userId,
    onChange
}: UseCampaignDataOptions): UseCampaignDataResult {
    const { data: campaign, loading } = useFirestoreRealtime('campaign', {
        filters: [
            { field: 'campaignCode', operator: '==', value: campaignCode }
        ],
        onChange(type, doc) {
            onChange?.(type, doc);
        }
    });

    const c = useMemo(() => campaign?.[0], [ campaign ])

    const { data: campaignCharsheets } = useFirestoreRealtime('charsheet', {
        enabled: !loading && !!c && c.players.length > 0,
        filters: [
            { field: 'id', operator: 'in', value: c?.players.map(p => p.charsheetId) }
        ]
    });

    const { data: campaignUsers } = useFirestoreRealtime('user', {
        enabled: !loading && !!c && (c.players.length > 0 || c.admin.length > 0),
        filters: [
            { field: 'id', operator: 'in', value: [ ...(c?.players.map(p => p.userId) || []), ...(c?.admin || []) ] }
        ]
    });

    // Estabilidade referencial item a item: uma mudança na ficha de UM jogador
    // mantém as referências das demais fichas/usuários, permitindo que
    // componentes memoizados (ex: PlayerCard) pulem renders.
    const stableCharsheets = useStableArrayItems(campaignCharsheets ?? [], cs => cs.id ?? '');
    const stableUsers = useStableArrayItems(campaignUsers ?? [], u => u.id ?? '');

    const messages = useStableValue(c?.session?.messages ?? EMPTY_MESSAGES);

    // Campanha sem as mensagens, estabilizada por conteúdo: um snapshot que só
    // acrescentou mensagem mantém a MESMA referência de campanha.
    const campaignSansMessages = useMemo(() => {
        if (!c) return null;
        return { ...c, session: { ...c.session, messages: EMPTY_MESSAGES } };
    }, [ c ]);
    const stableCampaign = useStableValue(campaignSansMessages);

    const campaignData = useMemo((): CampaignData | null => {
        if (!stableCampaign) return null;

        const adminUsers = stableUsers.filter(user =>
            stableCampaign.admin?.includes(user.id ?? '')
        );

        const playerUsers = stableUsers.filter(user =>
            !stableCampaign.admin?.includes(user.id ?? '')
        );

        const isUserGM = stableCampaign.admin?.includes(userId ?? '') || false;

        return {
            campaign: stableCampaign,
            users: {
                admin: adminUsers,
                players: playerUsers,
                all: stableUsers
            },
            charsheets: stableCharsheets,
            isUserGM
        };
    }, [ stableCampaign, stableUsers, stableCharsheets, userId ]);

    return { data: campaignData, messages };
}
