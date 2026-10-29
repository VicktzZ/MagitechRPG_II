import { useCampaignContext } from '@contexts';
import type { CampaignContextValue } from '@contexts/campaignContext';
import type { Campaign, Charsheet } from '@models/entities';
import { useMemo } from 'react';
import type { PlayerInfo } from './actions/types';

/**
 * Os jogadores da campanha com a ficha de cada um (nome, vida, atributos, vantagens desta campanha) no formato dos diálogos do mestre. `charsheets` é de onde as fichas
 * vêm: quem tem uma assinatura em tempo real passa a dele, os demais a da campanha.
 */
export function buildPlayerInfos(
    players: CampaignContextValue['users']['players'] | undefined,
    campaign: Pick<Campaign, 'players' | 'campaignCode'>,
    charsheets: readonly Charsheet[] | undefined
): PlayerInfo[] {
    return (players ?? []).map(player => {
        // campaign.players usa `userId`, não `odacId`
        const playerInCampaign = campaign.players?.find(candidate => (candidate as { odacId?: string }).odacId === player.id || candidate.userId === player.id);
        const charsheet = charsheets?.find(candidate => candidate.id === playerInCampaign?.charsheetId);
        // Vantagens adquiridas nesta campanha (sessão correspondente ao campaignCode)
        const campaignPerks = charsheet?.session?.find(session => session.campaignCode === campaign.campaignCode)?.perks ?? [];

        return {
            id: player.id,
            name: player.name || 'Jogador',
            avatar: player.image,
            charsheet: charsheet ? {
                id: charsheet.id,
                name: charsheet.name,
                level: charsheet.level,
                stats: charsheet.stats,
                inventory: charsheet.inventory,
                attributes: charsheet.attributes,
                perks: campaignPerks
            } : undefined
        };
    });
}

/** Os jogadores da campanha com a ficha, pela campanha em tempo real */
export function usePlayerInfos(): PlayerInfo[] {
    const { campaign, users, charsheets } = useCampaignContext();
    return useMemo(() => buildPlayerInfos(users.players, campaign, charsheets), [ users.players, campaign, charsheets ]);
}
