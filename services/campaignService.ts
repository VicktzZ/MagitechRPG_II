import { type Campaign } from '@types'

export const campaignService = {
    async fetch(queryParams?: Partial<Record<'code' | 'userId', string>>): Promise<Campaign[]> {
        let response

        if (queryParams) {
            response = await fetch(
                `/api/campaign?${Object.keys(queryParams)
                    .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
                    .join('&')}`
            ).then(async r => await r.json())
        } else {
            response = await fetch('/api/campaign').then(async r => await r.json())
        }

        return response
    },

    async getById(code: string): Promise<Campaign> {
        const response = await fetch(`/api/campaign?code=${code}`).then(async r => await r.json())
        return response
    },

    async create(campaign: Campaign): Promise<Campaign> {
        const response = await fetch('/api/campaign', {
            method: 'POST',
            body: JSON.stringify(campaign)
        }).then(async r => await r.json())
        return response
    },

    async updateById(id: string, campaign: Campaign): Promise<Campaign> {
        const response = await fetch(`/api/campaign/${id}`, {
            method: 'PUT',
            body: JSON.stringify(campaign)
        }).then(async r => await r.json())
        return response
    },

    async deleteById(id: string): Promise<Campaign> {
        const response = await fetch(`/api/campaign/${id}`, {
            method: 'DELETE'
        }).then(async r => await r.json())
        return response
    }
}
