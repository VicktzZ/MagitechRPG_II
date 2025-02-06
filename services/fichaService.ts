import { type Ficha } from '@types'

export const fichaService = {
    async fetch(queryParams?: Record<'user', string>): Promise<Ficha[]> {
        let response

        if (queryParams) {
            response = await fetch(
                `/api/ficha?${Object.keys(queryParams)
                    .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
                    .join('&')}`
            ).then(async r => await r.json())
        } else {
            response = await fetch('/api/ficha').then(async r => await r.json())
        }

        return response
    },

    async getById(id: string): Promise<Ficha> {
        const response = await fetch(`/api/ficha/${id}`).then(async r => await r.json())
        return response
    },

    async create(ficha: Ficha): Promise<Ficha> {
        const response = await fetch('/api/ficha', {
            method: 'POST',
            body: JSON.stringify(ficha)
        }).then(async r => await r.json())
        return response
    },

    async updateById(id: string, ficha: Ficha): Promise<Ficha> {
        const response = await fetch(`/api/ficha/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(ficha)
        }).then(async r => await r.json())
        return response
    },

    async deleteById(id: string): Promise<Ficha> {
        const response = await fetch(`/api/ficha/${id}`, {
            method: 'DELETE'
        }).then(async r => await r.json())
        return response
    }
}
