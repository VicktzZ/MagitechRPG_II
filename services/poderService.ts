import { type MagicPower } from '@types'

export const poderService = {
    async fetch(queryParams?: Record<'search' | 'filter' | 'sort' | 'order', string>): Promise<MagicPower[]> {
        let response

        if (queryParams) {
            response = await fetch(
                `/api/poder?${Object.keys(queryParams)
                    .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
                    .join('&')}`
            ).then(async r => await r.json())
        } else {
            response = await fetch('/api/poder').then(async r => await r.json())
        }

        return response
    },

    async getById(id: string): Promise<MagicPower> {
        const response = await fetch(`/api/poder/${id}`).then(async r => await r.json())
        return response
    },

    async create(poder: MagicPower): Promise<MagicPower> {
        const response = await fetch('/api/poder', {
            method: 'POST',
            body: JSON.stringify(poder)
        }).then(async r => await r.json())
        return response
    },

    async updateById(id: string, poder: MagicPower): Promise<MagicPower> {
        const response = await fetch(`/api/poder/${id}`, {
            method: 'PUT',
            body: JSON.stringify(poder)
        }).then(async r => await r.json())
        return response
    },

    async deleteById(id: string): Promise<MagicPower> {
        const response = await fetch(`/api/poder/${id}`, {
            method: 'DELETE'
        }).then(async r => await r.json())
        return response
    }
}
