import type { FirestoreOnChange } from '@models/types/firestoreRealtime';
import type { CampaignData } from '@models/types/session';
import type { Message } from '@models';
import type { User } from '@models/entities';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CampaignLookupError, resolveCampaignLoadStatus, type CampaignLoadStatus } from '@utils/campaignLoadStatus';
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
    /**
     * `loading` enquanto busca; `not-found` (código inexistente ou campanha
     * excluída) e `error` (falha de rede ou de permissão) deixam o spinner.
     */
    status: CampaignLoadStatus;
}

const EMPTY_MESSAGES: Message[] = [];

export function useCampaignData({
    campaignCode,
    userId,
    onChange
}: UseCampaignDataOptions): UseCampaignDataResult {
    // O código vira o ID pela API (o código é o convite da campanha). Com o ID, a
    // campanha é lida direto pelo documento: as regras do Firestore não deixam
    // listar/consultar a coleção de campanhas, só ler uma campanha conhecida.
    const { data: campaignRef, error: lookupError } = useQuery({
        queryKey: [ 'campaign-ref', campaignCode ],
        queryFn: async () => {
            const response = await fetch(`/api/campaign/${encodeURIComponent(campaignCode)}`);
            if (!response.ok) throw new CampaignLookupError(`Falha ao buscar a campanha (${response.status})`, response.status);
            return await response.json() as { id: string };
        },
        enabled: !!campaignCode,
        staleTime: Infinity,
        // Código inexistente não melhora com nova tentativa; falha de rede, sim
        retry: (failureCount, error) => !(error instanceof CampaignLookupError && error.status === 404) && failureCount < 1
    });
    const campaignId = campaignRef?.id;

    // O listener é recriado quando o ID chega; `loading` do hook fica falso por um
    // render antes disso, então só consideramos a resposta válida para o ID atual
    const [ settledId, setSettledId ] = useState<string>();

    const { data: campaign, loading, error: realtimeError } = useFirestoreRealtime('campaign', {
        filters: campaignId ? [ { field: 'id', operator: '==', value: campaignId } ] : undefined,
        enabled: !!campaignId,
        onChange(type, doc) {
            onChange?.(type, doc);
        },
        onNext() {
            setSettledId(campaignId);
        },
        onError() {
            setSettledId(campaignId);
        }
    });

    const c = useMemo(() => campaign?.[0], [ campaign ])

    const { data: campaignCharsheets } = useFirestoreRealtime('charsheet', {
        enabled: !loading && !!c && c.players.length > 0,
        filters: [
            { field: 'id', operator: 'in', value: c?.players.map(p => p.charsheetId) }
        ]
    });

    // Perfis públicos (id, nome, imagem) dos membros vêm da API — os documentos
    // `users` têm e-mail e assinatura e só são legíveis pelo próprio dono.
    // Recarrega quando alguém entra ou sai da campanha.
    const memberIds = useMemo(
        () => [ ...new Set([ ...(c?.players.map(p => p.userId) ?? []), ...(c?.admin ?? []) ]) ].sort(),
        [ c?.players, c?.admin ]
    );
    const { data: campaignUsers } = useQuery({
        queryKey: [ 'campaign-users', c?.id, memberIds.join(',') ],
        queryFn: async () => {
            const response = await fetch(`/api/campaign/${c.id}/users`);
            if (!response.ok) throw new Error(`Erro ao buscar membros da campanha (${response.status})`);
            return await response.json() as User[];
        },
        enabled: !loading && !!c && memberIds.length > 0
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

    const status = resolveCampaignLoadStatus({
        lookup: { pending: !campaignRef && !lookupError, error: lookupError },
        realtime: {
            settled: !!campaignId && settledId === campaignId && !loading,
            error: realtimeError,
            found: !!c
        }
    });

    return { data: campaignData, messages, status };
}
