import type { RealtimeOptions } from '@models/types/firestoreRealtime';
import { campaignService } from '@services';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFirestoreRealtime } from './useFirestoreRealtime';

export function useUserCampaigns(userId: string, options: RealtimeOptions = {}) {
    // 1) Busca os ids das campanhas do usuário via REST
    const { data, isPending, error } = useQuery({
        queryKey: [ 'campaigns', userId ],
        queryFn: async () => await campaignService.listByUser(userId),
        enabled: !!userId
    });

    // 2) Monta filtros somente quando há ids (Firestore não aceita array vazio em 'in')
    const adminFilters = useMemo(() => {
        const ids = data?.asGm?.map(c => c.id) ?? [];
        return ids.length > 0 ? [ { field: 'id', operator: 'in', value: ids } ] : undefined;
    }, [ data?.asGm ]);

    const playerFilters = useMemo(() => {
        const ids = data?.asPlayer?.map(c => c.id) ?? [];
        return ids.length > 0 ? [ { field: 'id', operator: 'in', value: ids } ] : undefined;
    }, [ data?.asPlayer ]);

    // 3) Busca realtime dos documentos das campanhas
    const { data: adminCampaigns, loading: adminCampsLoading, error: adminErr } = useFirestoreRealtime('campaign', {
        filters: adminFilters,
        enabled: !isPending && !!adminFilters,
        ...options
    });

    const { data: playerCampaigns, loading: playerCampsLoading, error: playerErr } = useFirestoreRealtime('campaign', {
        filters: playerFilters,
        enabled: !isPending && !!playerFilters,
        ...options
    });

    // 4) Une e deduplica
    const allCampaigns = useMemo(() => {
        const all = [ ...(adminCampaigns || []), ...(playerCampaigns || []) ];
        const map = new Map(all.map(c => [ c.id, c ]));
        return Array.from(map.values());
    }, [ adminCampaigns, playerCampaigns ]);

    return {
        data: allCampaigns,
        loading: isPending || adminCampsLoading || playerCampsLoading,
        error: (error as any) || adminErr || playerErr || null,
        adminCampaigns,
        playerCampaigns
    };
}
