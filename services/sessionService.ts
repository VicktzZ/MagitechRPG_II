import { type Player } from '@types'

export const sessionService = {
    async connect(campaignCode: string, player: Player): Promise<any> {
        const response = await fetch('/api/campaign/session', {
            method: 'POST',
            body: JSON.stringify({ campaignCode, player })
        }).then(async r => await r.json())
        return response
    },

    async disconnect(campaignCode: string, playerId: string): Promise<any> {
        const response = await fetch('/api/campaign/session', {
            method: 'DELETE',
            body: JSON.stringify({ campaignCode, playerId })
        }).then(async r => await r.json())
        return response
    }
}