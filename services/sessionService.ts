import type { Campaign } from '@types'

export const sessionService = {
    async connect({
        campaignCode,
        playerId,
        isGM
    }: {
        campaignCode: string
        playerId: string
        isGM: boolean
    }): Promise<Campaign> {
        console.log({ campaignCode, playerId, isGM })

        const response = await fetch('/api/campaign/session', {
            method: 'POST',
            body: JSON.stringify({ campaignCode, playerId, isGM })
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
