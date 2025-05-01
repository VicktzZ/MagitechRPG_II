import type { Campaign, Ficha, Note, Service, User } from '@types'
import { apiRequest } from '@utils/apiRequest'

const { get, post, patch, delete: del, url: campaignApi } = apiRequest<Campaign>('campaign')

interface ICampaignService extends Service<Campaign, 'code' | 'userId'> {
    getCampaignUsers: (id: string) => Promise<User[]>,
    createNote: (id: string, note: Note) => Promise<Campaign>,
    updateNote: (id: string, noteId: string, content: string) => Promise<Campaign>,
    deleteNote: (id: string, noteId: string) => Promise<Campaign>,
    removeUser: (id: string, userId: string) => Promise<Campaign>,
    updateUserFicha: (id: string, ficha: Ficha) => Promise<void>
}

export const campaignService: ICampaignService = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as Campaign[] },
    async getById(code) { return await get({ queryParams: { code } }) },
    async create(campaign) { return await post(campaign) },
    async updateById(body) { return await patch(body.id, body.data) },
    async deleteById(id) { return await del(id) },
    
    async getCampaignUsers(id) { return await campaignApi(`${id}/users`).get() as unknown as User[] },
    async createNote(id, note) { return await campaignApi(`${id}/notes`).post(note) },
    async updateNote(id, noteId, content) { return await campaignApi(`${id}/notes`).patch('', { noteId, content }) },
    async deleteNote(id, noteId) { return await campaignApi(`${id}/notes`).delete('', { noteId }) },
    async removeUser(id, userId) { return await campaignApi(`${id}/users`).delete('', { userId }) },
    async updateUserFicha(id, ficha) { await campaignApi(`${id}/update-user-ficha`).post(ficha) }
}
