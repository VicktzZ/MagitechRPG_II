import type { FirestoreOnChange } from '@models/types/firestoreRealtime';
import type { CampaignData } from '@models/types/session';
import { useMemo } from 'react';
import { useFirestoreRealtime } from './useFirestoreRealtime';

interface UseCampaignDataOptions {
    campaignCode: string;
    userId?: string;
    onChange?: FirestoreOnChange
}

export function useCampaignData({
    campaignCode,
    userId,
    onChange
}: UseCampaignDataOptions): CampaignData | null {
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

    const campaignData = useMemo((): CampaignData | null => {
        if (!c) return null;

        const adminUsers = campaignUsers?.filter(user =>
            c.admin?.includes(user.id ?? '')
        ) || [];

        const playerUsers = campaignUsers?.filter(user =>
            !c.admin?.includes(user.id ?? '')
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
