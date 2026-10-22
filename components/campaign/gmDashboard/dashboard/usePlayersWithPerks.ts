import { useCampaignContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { useMemo } from 'react';

// Extrai vantagens adquiridas por cada jogador. Vantagens podem ser
// oferecidas em QUALQUER modo de campanha (não só Roguelite), então esta
// visão não é mais restrita ao Roguelite — o mestre precisa ver o que cada
// jogador recebeu independentemente do modo.
export function usePlayersWithPerks(playerCharsheets: Charsheet[]) {
    const { campaign, users } = useCampaignContext();

    return useMemo(() => {
        if (!playerCharsheets) return [];

        return playerCharsheets.map(charsheet => {
            // Busca a sessão da campanha atual
            const session = charsheet.session?.find(s => s.campaignCode === campaign.campaignCode);
            const perks = session?.perks || [];

            // Busca dados do usuário para pegar a foto
            const user = users.players?.find(p => p.id === charsheet.userId);

            return {
                charsheetId: charsheet.id,
                charsheetName: charsheet.name,
                level: charsheet.level,
                perks,
                userImage: user?.image || null,
                userName: user?.name || charsheet.name
            };
        }).filter(p => p.perks.length > 0);
    }, [ campaign.campaignCode, playerCharsheets, users.players ]);
}

/** Jogador com as vantagens que já recebeu nesta campanha */
export type PlayerWithPerks = ReturnType<typeof usePlayersWithPerks>[number];
