import { type Magia } from '@types'

export const magiaService = {
    async fetch(queryParams?: Record<'search' | 'filter' | 'sort' | 'order', string>): Promise<Magia[]> {
        let response

        if (queryParams) {
            response = await fetch(
                `/api/magia?${Object.keys(queryParams)
                    .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
                    .join('&')}`
            ).then(async r => await r.json())
        } else {
            response = await fetch('/api/magia').then(async r => await r.json())
        }

        return response
    },

    async getById(id: string): Promise<Magia> {
        const response = await fetch(`/api/magia/${id}`).then(async r => await r.json())
        return response
    },

    async create(magia: Magia): Promise<Magia> {
        const response = await fetch('/api/magia', {
            method: 'POST',
            body: JSON.stringify(magia)
        }).then(async r => await r.json())
        return response
    },

    async updateById(id: string, magia: Magia): Promise<Magia> {
        const response = await fetch(`/api/magia/${id}`, {
            method: 'PUT',
            body: JSON.stringify(magia)
        }).then(async r => await r.json())
        return response
    },

    async deleteById(id: string): Promise<Magia> {
        const response = await fetch(`/api/magia/${id}`, {
            method: 'DELETE'
        }).then(async r => await r.json())
        return response
    }
}
