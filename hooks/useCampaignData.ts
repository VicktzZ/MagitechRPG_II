import type { CampaignData } from '@models/types/session';
import {
    useCampaignRealtime,
    useCharsheetsRealtime,
    useUsersRealtime
} from '@services/firestore/hooks';
import { useMemo } from 'react';

interface UseCampaignDataOptions {
    campaignCode: string;
    userId?: string;
}

export function useCampaignData({
    campaignCode,
    userId
}: UseCampaignDataOptions): CampaignData | null {
    const { data: campaign, loading } = useCampaignRealtime({
        filters: [
            { field: 'campaignCode', operator: '==', value: campaignCode }
        ]
    });

    const c = useMemo(() => campaign?.[0], [ campaign ])

    const { data: campaignCharsheets } = useCharsheetsRealtime({
        enabled: !loading && !!c,
        filters: [
            { field: 'id', operator: 'in', value: c?.players.map(p => p.charsheetId) }
        ]
    });

    const { data: campaignUsers } = useUsersRealtime({
        enabled: !loading && !!c,
        filters: [
            { field: 'id', operator: 'in', value: [ ...(c?.players.map(p => p.userId) || []), ...(c?.admin || []) ] }
        ]
    });

    const campaignData = useMemo((): CampaignData | null => {
        if (!c) return null;

        const adminUsers = campaignUsers?.filter(user =>
            c.admin?.includes(user.id ?? '')
        ) || [];

        const playerUsers = campaignUsers?.filter(user =>
            !c.admin?.includes(user.id ?? ' ')
        ) || [];

        const isUserGM = c.admin?.includes(userId ?? '') || false;
        const charsheets = campaignCharsheets || [];

        return {
            campaign: c,
            users: {
                admin: adminUsers,
                players: playerUsers,
                all: campaignUsers || []
            },
            charsheets,
            isUserGM
        };
    }, [ campaign, campaignUsers, campaignCharsheets, userId, campaignCode ]);

    return campaignData;
}
