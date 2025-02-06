import { type User } from '@types'

export const userService = {
    async getById(id: string): Promise<User> {
        const response = await fetch(`/api/user/${id}`).then(async r => await r.json())
        return response
    },

    async create(user: User): Promise<User> {
        const response = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify(user)
        }).then(async r => await r.json())
        return response
    },

    async updateById(id: string, user: User): Promise<User> {
        const response = await fetch(`/api/user/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(user)
        }).then(async r => await r.json())
        return response
    },

    async deleteById(id: string): Promise<User> {
        const response = await fetch(`/api/user/${id}`, {
            method: 'DELETE'
        }).then(async r => await r.json())
        return response
    }
}