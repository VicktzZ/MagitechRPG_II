import { campaignService } from '@services';
import {
    CampaignEntity,
    CharsheetEntity,
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
import { useCallback, useMemo } from 'react';
import type { FirestoreQueryOptions, RealtimeOptions } from './types';
import { QueryBuilder } from './utils';
import type { Campaign, Charsheet, Power, Spell, User } from '@models/entities';

interface UserCampaignsResponse extends Record<'asGm' | 'asPlayer', Array<Record<'id' | 'code', string>>> {}

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

export function useCharsheets(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(CharsheetEntity, options);
}

export function useCharsheetsRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Charsheet>(CharsheetEntity as any, options);
}

export function useCharsheet(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Charsheet>(CharsheetEntity as any, id, options);
}

export function useCharsheetCRUD() {
    return useFirestoreCRUD(CharsheetEntity);
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

// Hook para spells com funcionalidades específicas
export function useSpells(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(SpellEntity, options);
}

export function useSpellsRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Spell>(SpellEntity as any, options);
}

export function useSpell(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Spell>(SpellEntity as any, id, options);
}
// Hook para poderes com funcionalidades específicas
export function usePowers(options: FirestoreQueryOptions = {}) {
    return useFirestoreEntity(PowerEntity, options);
}

export function usePowersRealtime(options: FirestoreQueryOptions & RealtimeOptions = {}) {
    return useFirestoreRealtime<Power>(PowerEntity as any, options);
}

export function usePower(id: string, options: RealtimeOptions = {}) {
    return useFirestoreDocument<Power>(PowerEntity as any, id, options);
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
// Hook para spells paginadas
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
// Hook para buscar spells
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
            { field: 'id', operator: 'in', value: data.asGm.map(c => c.id) }
        ] : undefined,
    [ data?.asGm ]
    );

    const playerFilters = useMemo(() =>
        data && data.asPlayer.length > 0 ? [
            { field: 'id', operator: 'in', value: data.asPlayer.map(c => c.id) }
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
            campaignMap.set(campaign.id, campaign);
        });

        playerCampaigns.forEach(campaign => {
            campaignMap.set(campaign.id, campaign);
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

// Hook para atualizar charsheets em tempo real
export function useCharsheetUpdater(charsheetId: string) {
    const { update } = useCharsheetCRUD();

    const updateCharsheet = useCallback(async (data: Partial<Charsheet>) => {
        if (!charsheetId) return;

        try {
            await update(charsheetId, data);
            console.log('[CharsheetUpdater] Charsheet atualizada:', charsheetId);
        } catch (error) {
            console.error('[CharsheetUpdater] Erro ao atualizar charsheet:', error);
            throw error;
        }
    }, [ charsheetId, update ]);

    return { updateCharsheet };
}
