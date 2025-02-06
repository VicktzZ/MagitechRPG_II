import { type Player } from '@types'

export const sessionService = {
    async connect(campaignCode: string, player: Player) {
        const response = await fetch('/api/session', {
            method: 'POST',
            body: JSON.stringify({ campaignCode, player })
        }).then(async r => await r.json())
        return response
    },

    async disconnect(campaignCode: string, playerId: string) {
        const response = await fetch('/api/session', {
            method: 'DELETE',
            body: JSON.stringify({ campaignCode, playerId })
        }).then(async r => await r.json())
        return response
    }
}