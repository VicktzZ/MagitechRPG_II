import type { Campaign, Player } from '@types'

export const sessionService = {
    async connect(campaignCode: string, player: Player, isGm: boolean): Promise<Campaign> {
        const response = await fetch('/api/campaign/session', {
            method: 'POST',
            body: JSON.stringify({ campaignCode, player, isGm })
        }).then(async r => await r.json())
        return response
    },

    async disconnect(campaignCode: string, playerId: string): Promise<Campaign> {
        const response = await fetch('/api/campaign/session', {
            method: 'DELETE',
            body: JSON.stringify({ campaignCode, playerId })
        }).then(async r => await r.json())
        return response
    }
}