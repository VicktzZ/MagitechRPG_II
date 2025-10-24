import { campaignService } from '@services';
import {
    CampaignEntity,
    FichaEntity,
    NotificationEntity,
    PowerEntity,
    SpellEntity,
    useFirestoreCRUD,
    useFirestoreDocument,
    useFirestoreEntity,
    useFirestorePagination,
    useFirestoreRealtime,
    UserEntity
} from '@services/firestore/entities';
import { useQuery } from '@tanstack/react-query';
import type { Campaign, Ficha, Magia, MagicPower, Notification, User } from '@types';
import { useCallback, useMemo } from 'react';
import type { FirestoreQueryOptions, RealtimeOptions } from './types';
import { QueryBuilder } from './utils';

interface UserCampaignsResponse extends Record<'asGm' | 'asPlayer', Array<Record<'_id' | 'code', string>>> {}

// === UTILITÁRIOS PARA CONSTRUÇÃO DE QUERIES ===

// === HOOKS ESPECÍFICOS PARA CADA ENTIDADE ===

// Hook para campanhas com funcionalidades específicas
export function useCampaigns(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(CampaignEntity, options);
}

export function useCampaignRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Campaign>(CampaignEntity as any, options);
}

export function useCampaign(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Campaign>(CampaignEntity as any, id, options);
}
// Hook para fichas com funcionalidades específicas
export function useFichas(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(FichaEntity, options);
}

export function useFichasRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Ficha>(FichaEntity as any, options);
}

export function useFicha(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Ficha>(FichaEntity as any, id, options);
}

export function useFichaCRUD() {
    return useFirestoreCRUD(FichaEntity);
}

// Hook para usuários com funcionalidades específicas
export function useUsers(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(UserEntity, options);
}

export function useUsersRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<User>(UserEntity as any, options);
}

export function useUser(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<User>(UserEntity as any, id, options);
}

// Hook para magias com funcionalidades específicas
export function useSpells(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(SpellEntity, options);
}

export function useSpellsRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Magia>(SpellEntity as any, options);
}

export function useSpell(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Magia>(SpellEntity as any, id, options);
}
// Hook para poderes com funcionalidades específicas
export function usePowers(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(PowerEntity, options);
}

export function usePowersRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<MagicPower>(PowerEntity as any, options);
}

export function usePower(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<MagicPower>(PowerEntity as any, id, options);
}

// Hook para notificações com funcionalidades específicas
export function useNotifications(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(NotificationEntity, options);
}

export function useNotificationsRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Notification>(NotificationEntity as any, options);
}

export function useNotification(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Notification>(NotificationEntity as any, id, options);
}

// Hook para buscar campanhas por código
export function useCampaignByCode(campaignCode: string, options: RealtimeOptions = {}) {
    return useCampaignRealtime({
        filters: [
            QueryBuilder.equals('campaignCode', campaignCode)
        ],
        ...options
    });
}

// Hook para notificações do usuário atual
export function useMyNotifications(userId: string, options: RealtimeOptions = {}) {
    return useNotificationsRealtime({
        filters: [
            QueryBuilder.equals('userId', userId)
        ],
        orderBy: [
            QueryBuilder.desc('timestamp')
        ],
        ...options
    });
}

// Hook para notificações não lidas
export function useUnreadNotifications(userId: string, options: RealtimeOptions = {}) {
    return useNotificationsRealtime({
        filters: [
            QueryBuilder.equals('userId', userId),
            QueryBuilder.equals('read', false)
        ],
        orderBy: [
            QueryBuilder.desc('timestamp')
        ],
        ...options
    });
}
// Hook para magias paginadas
export function useSpellsPaginated(pageSize: number = 20, initialPage: number = 1) {
    return useFirestorePagination(SpellEntity, {
        pageSize,
        initialPage,
        orderBy: [
            QueryBuilder.asc('nível'),
            QueryBuilder.asc('nome')
        ]
    });
}

// Hook para poderes paginados
export function usePowersPaginated(pageSize: number = 20, initialPage: number = 1) {
    return useFirestorePagination(PowerEntity, {
        pageSize,
        initialPage,
        orderBy: [
            QueryBuilder.asc('nome')
        ]
    });
}
// Hook para buscar magias
export function useSpellSearch(searchTerm: string, options: RealtimeOptions = {}) {
    return useSpellsRealtime({
        filters: searchTerm ? [
            QueryBuilder.greaterThanOrEqual('nome', searchTerm),
            QueryBuilder.lessThanOrEqual('nome', searchTerm + '\uf8ff')
        ] : undefined,
        orderBy: [
            QueryBuilder.asc('nome')
        ],
        ...options
    });
}

// Hook para buscar poderes
export function usePowerSearch(searchTerm: string, options: RealtimeOptions = {}) {
    return usePowersRealtime({
        filters: searchTerm ? [
            QueryBuilder.greaterThanOrEqual('nome', searchTerm),
            QueryBuilder.lessThanOrEqual('nome', searchTerm + '\uf8ff')
        ] : undefined,
        orderBy: [
            QueryBuilder.asc('nome')
        ],
        ...options
    });
}

// Hook para campanhas do usuário atual baseado na API
export function useUserCampaigns(userId: string, options: RealtimeOptions = {}) {
    const { data, isPending } = useQuery({
        queryKey: [ 'campaigns', userId ],
        queryFn: async () => await campaignService.fetch({ queryParams: { userId } }) as unknown as UserCampaignsResponse,
        enabled: !!userId
    });

    const adminFilters = useMemo(() =>
        data && data.asGm.length > 0 ? [
            { field: '_id', operator: 'in', value: data.asGm.map(c => c._id) }
        ] : undefined,
    [ data?.asGm ]
    );

    const playerFilters = useMemo(() =>
        data && data.asPlayer.length > 0 ? [
            { field: '_id', operator: 'in', value: data.asPlayer.map(c => c._id) }
        ] : undefined,
    [ data?.asPlayer ]
    );

    const { data: adminCampaigns, loading: adminCampsLoading } = useCampaignRealtime({
        filters: adminFilters,
        enabled: !isPending && !!adminFilters,
        ...options
    });

    const { data: playerCampaigns, loading: playerCampsLoading } = useCampaignRealtime({
        filters: playerFilters,
        enabled: !isPending && !!playerFilters,
        ...options
    });

    const allCampaigns = useMemo(() => {
        if (!adminCampaigns && !playerCampaigns) return [];
        if (!adminCampaigns) return playerCampaigns || [];
        if (!playerCampaigns) return adminCampaigns || [];

        const campaignMap = new Map();

        adminCampaigns.forEach(campaign => {
            campaignMap.set(campaign._id, campaign);
        });

        playerCampaigns.forEach(campaign => {
            campaignMap.set(campaign._id, campaign);
        });

        return Array.from(campaignMap.values());
    }, [ adminCampaigns, playerCampaigns ]);

    return {
        data: allCampaigns,
        loading: isPending || adminCampsLoading || playerCampsLoading,
        error: null, // TODO: Adicionar tratamento de erro
        adminCampaigns,
        playerCampaigns
    };
}

// Hook para atualizar fichas em tempo real
export function useFichaUpdater(fichaId: string) {
    const { update } = useFichaCRUD();

    const updateFicha = useCallback(async (data: Partial<Ficha>) => {
        if (!fichaId) return;

        try {
            await update(fichaId, data);
            console.log('[FichaUpdater] Ficha atualizada:', fichaId);
        } catch (error) {
            console.error('[FichaUpdater] Erro ao atualizar ficha:', error);
            throw error;
        }
    }, [ fichaId, update ]);

    return { updateFicha };
}
