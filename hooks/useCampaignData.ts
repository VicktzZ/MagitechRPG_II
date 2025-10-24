import {
    useCampaignRealtime,
    useFichasRealtime,
    useUsersRealtime
} from '@services/firestore/hooks';
import type { Campaign, Ficha, User } from '@types';
import { useMemo } from 'react';

interface UseCampaignDataOptions {
    campaignCode: string;
    userId?: string;
}

interface CampaignDataResponse {
    campaign: Campaign;
    users: {
        admin: User[];
        players: User[];
        all: User[];
    };
    fichas: Ficha[];
    isUserGM: boolean;
    code: string;
}

export function useCampaignData({
    campaignCode,
    userId
}: UseCampaignDataOptions): CampaignDataResponse | null {
    // 🔥 Buscar campanha em tempo real (só quando código é válido)
    const campaign = useCampaignRealtime({
        filters: campaignCode && campaignCode.trim() ? [
            { field: 'campaignCode', operator: '==', value: campaignCode }
        ] : undefined
    }).data[0];

    const { data: campaignFichas } = useFichasRealtime({
        filters: campaign && campaignCode ? [
            { field: '_id', operator: 'in', value: campaign.players.map(p => p.fichaId) }
        ] : undefined
    });

    const { data: campaignUsers } = useUsersRealtime({
        filters: campaign && campaignCode ? [
            { field: '_id', operator: 'in', value: [ ...campaign.players.map(p => p.userId), ...campaign.admin ] }
        ] : undefined
    });

    const campaignData = useMemo((): CampaignDataResponse | null => {
        if (!campaign) return null;

        const adminUsers = campaignUsers?.filter(user =>
            campaign.admin?.includes(user._id ?? '')
        ) || [];

        const playerUsers = campaignUsers?.filter(user =>
            !campaign.admin?.includes(user._id ?? ' ')
        ) || [];

        const isUserGM = campaign.admin?.includes(userId ?? '') || false;
        const fichas = campaignFichas || [];

        return {
            campaign,
            users: {
                admin: adminUsers,
                players: playerUsers,
                all: campaignUsers || []
            },
            fichas,
            isUserGM,
            code: campaignCode
        };
    }, [ campaign, campaignUsers, campaignFichas, userId, campaignCode ]);

    return campaignData;
}
