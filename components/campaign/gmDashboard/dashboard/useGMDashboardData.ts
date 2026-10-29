import { useCampaignContext } from '@contexts';
import { useMemo } from 'react';

/** Fichas dos jogadores e a faixa de estatísticas da campanha (jogadores, nível médio e maior nível) */
export function useGMDashboardData() {
    const { campaign, users, charsheets } = useCampaignContext();

    // As fichas já chegam em tempo real pelo campaignContext (useCampaignData) —
    // assinar de novo aqui duplicava o listener do Firestore para os mesmos docs.
    const playerCharsheets = charsheets;
    const isPlayerCharsheetsPending = campaign.players.length > 0 && charsheets.length === 0;

    const players = useMemo(() => {
        return users.players?.map(player => {
            const playerCharsheet = playerCharsheets?.find(f => f.userId === player.id)
    
            return {
                id: player.id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                status: [],
                charsheet: playerCharsheet
            }
        })
    }, [ users, playerCharsheets ])

    const campaignStats = useMemo(() => {
        const totalPlayers = players?.length ?? 0;
        const averageLevel = playerCharsheets?.length 
            ? Math.round(playerCharsheets.reduce((sum, f) => sum + f.level, 0) / playerCharsheets.length)
            : 0;
        const highestLevel = playerCharsheets?.length 
            ? Math.max(...playerCharsheets.map(f => f.level))
            : 0;
        
        return {
            totalPlayers,
            averageLevel,
            highestLevel
        };
    }, [ players, playerCharsheets ]);

    return { playerCharsheets, isPlayerCharsheetsPending, campaignStats };
}
