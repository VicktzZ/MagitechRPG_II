import { useCampaignContext } from '@contexts';
import type { SessionPlayer } from '@features/roguelite/components';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/** Jogadores da sessão que podem receber uma doação (todos menos o jogador atual) */
export function useSessionPlayers(): SessionPlayer[] {
    const { users, campaign, charsheets } = useCampaignContext();
    const { data: session } = useSession();

    // Prepara lista de jogadores da sessão (excluindo o jogador atual)
    return useMemo(() => {
        const currentUserId = session?.user?.id;
        const campaignPlayers = campaign?.players || [];
        const allCharsheets = charsheets || [];
        
        return users.players
            .filter(player => player.id !== currentUserId)
            .map(player => {
                const playerInCampaign = campaignPlayers.find((cp: any) => cp.userId === player.id);
                const playerCharsheet = playerInCampaign 
                    ? allCharsheets.find((cs: any) => cs.id === playerInCampaign.charsheetId)
                    : undefined;
                
                return {
                    odac: player.name || 'Jogador',
                    name: playerCharsheet?.name || `Ficha de ${player.name || 'Jogador'}`,
                    odacId: player.id,
                    odacImage: player.image,
                    charsheetId: playerCharsheet?.id || playerInCampaign?.charsheetId || '',
                    weaponCount: playerCharsheet?.inventory?.weapons?.length || 0,
                    armorCount: playerCharsheet?.inventory?.armors?.length || 0,
                    currentCargo: playerCharsheet?.capacity?.cargo || 0,
                    maxCargo: playerCharsheet?.capacity?.max || 0
                };
            })
            .filter(p => p.charsheetId);
    }, [ users.players, session?.user?.id, charsheets, campaign?.players ]);
}
